// src/services/interactions/button.js

/**
 * Stub service for the /button command.
 * @param {import('discord.js').CommandInteraction} interaction
 * @returns {Promise<object>} embed & button data
 */
export default async function handleButton(interaction) {
  // Example business logic: just return static embed data and button label
  return {
    template: "info",
    title: "Button Created",
    description: "Click the button below to see it again.",
    buttonLabel: "Click Me!",
  };
}
