const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const { t } = require('./translator');

module.exports = function buildEventEmbed(event, locale = 'en') {
  const embed = new EmbedBuilder()
    .setTitle(event.title)
    .setDescription(event.description || t('event.defaultDescription', locale))
    .addFields(
      { name: t('event.fields.start', locale), value: moment.utc(event.start).format('YYYY-MM-DD HH:mm [UTC]'), inline: true },
      { name: t('event.fields.end', locale), value: event.end ? moment.utc(event.end).format('YYYY-MM-DD HH:mm [UTC]') : t('event.fields.none', locale), inline: true }
    )
    .setFooter({ text: t('event.embed.footer', locale) })
    .setColor('#4DB6E2');

  return embed;
};
