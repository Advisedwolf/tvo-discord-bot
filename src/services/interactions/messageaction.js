// src/services/functions/messageaction.js
/**
 * Stub service for the Message Context Menu "messageAction" command.
 * @param {import('discord.js').ContextMenuCommandInteraction} interaction
 * @returns {Promise<object>} embed data
 */
export default async function handleMessageAction(interaction) {
  const message = interaction.targetMessage;
  return {
    template: "info",
    title: "Message Action Invoked",
    description: `You ran the message action on message ID **${message.id}**.`,
  };
}
