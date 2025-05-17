// src/services/functions/modal.js
/**
 * Stub service for the Slash Command "modal" interaction.
 * Handles both modal display and submission.
 * @param {import('discord.js').Interaction} interaction
 * @returns {Promise<object>} embed data for submission
 */
export default async function handleModal(interaction) {
  if (interaction.isChatInputCommand()) {
    // no embed data needed when showing modal
    return {
      // this branch is handled in command; return minimal
      template: 'info',
      title: 'Modal Opened',
      description: 'Please fill out the modal.',
    };
  }
  if (interaction.isModalSubmit()) {
    const feedback = interaction.fields.getTextInputValue('feedback');
    return {
      template: 'info',
      title: 'Feedback Received',
      description: `Thanks for your feedback: "${feedback}"`,
    };
  }
  return {
    template: 'error',
    title: 'Invalid Interaction',
    description: 'This interaction is not supported.',
  };
}
