//      src/commands/Interaction/ping.js
import { SlashCommandBuilder } from 'discord.js';
import { UserProfile } from '../models/UserProfile.js';
import { t } from '../utils/translator.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong and logs user profile status');

export async function execute(interaction) {
  let locale = 'en';

  try {
    // Fetch or create the user’s profile to get their locale
    let profile = await UserProfile.findOne({ discordId: interaction.user.id });
    if (!profile) {
      profile = await UserProfile.create({ discordId: interaction.user.id });
      console.log(`Created new profile for ${interaction.user.tag}`);
    } else {
      console.log(`Loaded profile for ${interaction.user.tag}`);
    }
    locale = profile.locale || locale;
  } catch (err) {
    console.error(`Error fetching/creating UserProfile for ${interaction.user.tag}:`, err);
  }

  // Translate the reply
  const message = t('ping.success', {}, locale);

  // Reply to the interaction
  await interaction.reply({ content: message, flags: 64 });
}

// PRECOMMIT TEST  - a second change.... now a third change...
