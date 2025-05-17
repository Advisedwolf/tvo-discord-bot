// src/services/functions/selectmenu.js
/**
 * Stub service for the Slash Command "selectmenu" interaction.
 * Handles both initial menu presentation and selection.
 * @param {import('discord.js').Interaction} interaction
 * @returns {Promise<object>} data for menu and embed
 */
export default async function handleSelectmenu(interaction) {
  if (interaction.isChatInputCommand()) {
    // initial menu data
    return {
      prompt: 'Pick something:',
      placeholder: 'Choose an option…',
      options: [
        { label: 'Option A', value: 'optA' },
        { label: 'Option B', value: 'optB' },
      ],
      // embed data after selection
      template: 'info',
      title: 'Menu Presented',
      description: 'Please make a selection.',
    };
  }
  if (interaction.isStringSelectMenu()) {
    const choice = interaction.values.join(', ');
    return {
      template: 'info',
      title: 'Selection Received',
      description: `You selected: ${choice}`,
    };
  }
  // fallback
  return {
    template: 'error',
    title: 'Invalid Interaction',
    description: 'This interaction is not supported.',
  };
}
