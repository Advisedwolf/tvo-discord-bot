// src/services/shieldScheduler.js
// Background job to update shield embeds, send warnings and clean up

const moment = require('moment');
const Shield = require('../models/Shield');
const { t } = require('../utils/translator');
const logger = require('../utils/logger');

let intervalHandle;

async function startShieldScheduler(client) {
  if (intervalHandle) clearInterval(intervalHandle);

  intervalHandle = setInterval(async () => {
    const now = moment.utc();
    logger.debug('Running shield scheduler tick...', 'scheduler');

    // 1) Fetch all active shields
    const shields = await Shield.find({
      lastStatus: { $in: ['active', 'ending_soon'] }
    });

    for (const shield of shields) {
      const channel = await client.channels.fetch(process.env.SHIELD_CHANNEL_ID).catch(() => null);
      if (!channel) continue;

      const msg = await channel.messages.fetch(shield.messageId).catch(() => null);
      if (!msg) continue;

      const start = moment.utc(shield.startTime);
      const end   = moment.utc(shield.endTime);
      const diff  = end.diff(now, 'minutes');

      // <30 min → bump & mark ending soon
      if (diff <= 30 && shield.lastStatus === 'active') {
        logger.info(`Shield ${shield._id} is now ending soon (${diff} min left)`, 'scheduler');
        // edit embed color & title
        const embed = msg.embeds[0];
        embed.setColor('#FFC107');
        embed.setTitle(t('shield.embed.titleEndingSoon', shield.playerLocale));
        await msg.edit({ embeds: [embed] });

        // reply to bump
        await channel.send({
          content: t('shield.scheduler.bumpEndingSoon', shield.playerLocale),
          allowedMentions: { parse: [] },
          reply: { messageReference: shield.messageId }
        });
        shield.lastStatus = 'ending_soon';
        await shield.save();
      }

      // 15-min warning DM
      if (diff <= 15 && diff > 0 && !shield.warned15min) {
       logger.info(`Sending 15-min warnings for shield ${shield._id}`, 'scheduler');
        for (const uid of shield.reactedUserIds) {
          const user = await client.users.fetch(uid).catch(() => null);
          if (user) user.send(t('shield.scheduler.warn15minDM', shield.playerLocale, { location: shield.location }));
        }
        shield.warned15min = true;
        await shield.save();
      }

      // expiry
      if (now.isSameOrAfter(end)) {
        logger.info(`Shield ${shield._id} has expired`, 'scheduler');
        // edit embed to expired
        const embed = msg.embeds[0];
        embed.setColor('#E53935');
        embed.setTitle(t('shield.embed.titleExpired', shield.playerLocale));
        await msg.edit({ embeds: [embed] });

        // bump expired
        await channel.send({
          content: t('shield.scheduler.bumpExpired', shield.playerLocale),
          reply: { messageReference: shield.messageId }
        });

        // schedule deletion + cleanup
        setTimeout(async () => {
          await msg.delete().catch(() => {});
          logger.debug(`Cleaning up expired shield ${shield._id}`, 'scheduler');
          // remove future bump messages
          const thread = await channel.messages.fetch(shield.messageId).catch(() => null);
          if (thread) thread.delete().catch(() => {});

          // finally delete from DB
          await Shield.deleteOne({ _id: shield._id });
        }, 10 * 60 * 1000); // +10 minutes

        shield.lastStatus = 'expired';
        await shield.save();
      }
    }
  }, 5 * 60 * 1000); // every 5 minutes

  logger.info('🕵️‍♀️ Shield scheduler started, checking every 5 minutes', 'scheduler');

}

module.exports = { startShieldScheduler };
