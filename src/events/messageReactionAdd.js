// src/events/messageReactionAdd.js

const { Events } = require('discord.js');
const { t } = require('../utils/translator');
const logger = require('../utils/logger');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    try {
      // Fetch full objects if partial
      if (reaction.partial) await reaction.fetch();
      if (reaction.message.partial) await reaction.message.fetch();
      if (user.partial) await user.fetch();

      const message = reaction.message;
      const channelId = '1368751361394479114'; // Event plans

      if (message.channel.id !== channelId) {
        logger.debug(`Reaction in different channel: ${message.channel.id}`, 'reaction');
        return;
      }

      logger.debug(`Reaction added in target channel by ${user.tag}`, 'reaction');

      const dm = await user.createDM();
      await dm.send(t('reaction.eventReactionConfirm', 'en'));

    } catch (err) {
      logger.error(`Failed to handle reaction add: ${err.message}`, 'reaction');
    }
  }
};