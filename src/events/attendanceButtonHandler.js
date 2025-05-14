
// src/handlers/attendanceButtonHandler.js
// Handles ✅ Interested / ❌ Not Attending button interactions

const Event = require('../models/Event');
const UserProfile = require('../models/UserProfile');
const logger = require('../utils/logger');
const { t } = require('../utils/translator');

module.exports = async function attendanceButtonHandler(interaction) {
  const [prefix, eventId, choice] = interaction.customId.split('_');
  const userId = interaction.user.id;

  logger.debug(`Button interaction received: ${interaction.customId} by ${interaction.user.tag}`, 'events');

  try {
    const event = await Event.findOne({ eventId });
    if (!event) {
      logger.warn(`Event not found: ${eventId}`, 'events');
      return interaction.reply({ content: t('event.notFound', 'en'), ephemeral: true });
    }

    const profile = await UserProfile.findOne({ userId }) || {};
    const locale = profile.locale || interaction.locale?.split('-')[0] || 'en';

    // Remove from both lists
    event.attendees.interested = event.attendees.interested.filter(id => id !== userId);
    event.attendees.notAttending = event.attendees.notAttending.filter(id => id !== userId);

    if (choice === 'yes') {
      event.attendees.interested.push(userId);
    } else {
      event.attendees.notAttending.push(userId);
    }

    await event.save();

    await interaction.reply({
      content: choice === 'yes'
        ? t('event.attendingYes', locale)
        : t('event.attendingNo', locale),
      ephemeral: true
    });

    logger.info(`Attendance updated: ${interaction.user.tag} => ${choice}`, 'events');
  } catch (err) {
    logger.error(`Error updating attendance: ${err.message}`, 'events');
    await interaction.reply({
      content: t('event.updateError', 'en'),
      ephemeral: true
    });
  }
};
