// src/services/functions/useraction.js
/**
 * Stub service for the User Context Menu "userAction" command.
 * @param {import('discord.js').ContextMenuCommandInteraction} interaction
 * @returns {Promise<object>} embed data
 */
export default async function handleUserAction(interaction) {
  const user = interaction.targetUser;
  return {
    template: 'info',
    title: 'User Action Invoked',
    description: `You selected user **${user.tag}** via context menu.`,
  };
}
