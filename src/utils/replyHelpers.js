// src/utils/replyHelpers.js
import { createEmbed } from '../services/functions/embedService.js';
import { t } from './translator.js';

/**
 * Determine locale priority: user override → Discord locale → default 'en'
 */
function resolveLocale(interaction) {
  return (
    interaction.userProfile?.locale ||
    interaction.locale ||
    'en'
  );
}

/**
 * Standard error reply, always ephemeral via flags (64), with localization override.
 */
export async function replyError(
  interaction,
  errorKey = 'ERRORS.generic',
  params = {}
) {
  const locale = resolveLocale(interaction);
  const title = t('ERRORS.title', {}, locale);
  const description = t(errorKey, params, locale);

  const embed = createEmbed('error', { title, description });
  const payload = { embeds: [embed], flags: 64 };

  if (interaction.replied || interaction.deferred) {
    return interaction.followUp(payload);
  }
  return interaction.reply(payload);
}

/**
 * Standard success/info reply, always ephemeral via flags (64).
 * Can accept a translation key or pre-localized content.
 */
export async function replySuccess(
  interaction,
  keyOrContent,
  params = {}
) {
  const locale = resolveLocale(interaction);
  let title;
  let description = '';

  if (typeof keyOrContent === 'string') {
    title = t(keyOrContent, params, locale);
  } else {
    title = keyOrContent.title;
    description = keyOrContent.description;
  }

  const embed = createEmbed('info', { title, description });
  const payload = { embeds: [embed], flags: 64 };

  if (interaction.replied || interaction.deferred) {
    return interaction.followUp(payload);
  }
  return interaction.reply(payload);
}

