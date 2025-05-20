// src/handlers/interactionCreate.js
import logger from '../utils/logger.js';
import { replyError } from '../utils/replyHelpers.js';

export default {
  name: 'interactionCreate',
  async execute(client, interaction) {
    // 1) Load user profile for locale override
    try {
      const UserProfile = (await import('../models/UserProfile.js')).default;
      const profile = await UserProfile.findOneAndUpdate(
        { userId: interaction.user.id },
        { userId: interaction.user.id },
        { upsert: true, new: true }
      );
      interaction.userProfile = profile;
    } catch (err) {
      logger.error('[interactionCreate] Failed to load user profile', err);
    }

    // 2) Determine handler set based on environment
    const env = process.env.NODE_ENV || 'live';
    const handlers = {
      slashHandler: client.slashHandler,
      buttonHandler: env === 'test' ? client.testButtonHandler : client.buttonHandler,
      modalHandler: env === 'test' ? client.testModalHandler : client.modalHandler,
      selectMenuHandler: env === 'test' ? client.testSelectMenuHandler : client.selectMenuHandler,
      userContextMenuHandler: client.userContextMenuHandler,
      messageContextMenuHandler: client.messageContextMenuHandler,
    };

    try {
      if (interaction.isChatInputCommand()) {
        if (!handlers.slashHandler) {
          logger.warn('[interactionCreate] No slashHandler registered');
          return replyError(interaction, 'ERRORS.handler_not_found');
        }
        await handlers.slashHandler.handle(interaction);

      } else if (interaction.isButton()) {
        if (!handlers.buttonHandler) {
          logger.warn('[interactionCreate] No buttonHandler registered');
          return replyError(interaction, 'ERRORS.handler_not_found');
        }
        await handlers.buttonHandler.handle(interaction);

      } else if (interaction.isModalSubmit()) {
        if (!handlers.modalHandler) {
          logger.warn('[interactionCreate] No modalHandler registered');
          return replyError(interaction, 'ERRORS.handler_not_found');
        }
        await handlers.modalHandler.handle(interaction);

      } else if (interaction.isSelectMenu()) {
        if (!handlers.selectMenuHandler) {
          logger.warn('[interactionCreate] No selectMenuHandler registered');
          return replyError(interaction, 'ERRORS.handler_not_found');
        }
        await handlers.selectMenuHandler.handle(interaction);

      } else if (interaction.isUserContextMenuCommand()) {
        if (!handlers.userContextMenuHandler) {
          logger.warn('[interactionCreate] No userContextMenuHandler registered');
          return replyError(interaction, 'ERRORS.handler_not_found');
        }
        await handlers.userContextMenuHandler.handle(interaction);

      } else if (interaction.isMessageContextMenuCommand()) {
        if (!handlers.messageContextMenuHandler) {
          logger.warn('[interactionCreate] No messageContextMenuHandler registered');
          return replyError(interaction, 'ERRORS.handler_not_found');
        }
        await handlers.messageContextMenuHandler.handle(interaction);

      } else {
        logger.info('[interactionCreate] Unknown interaction type');
      }
    } catch (error) {
      // Log error for diagnostics
      logger.error('[interactionCreate] Error handling interaction', error);
      // Localized, standardized error embed
      await replyError(interaction);
    }
  },
};

