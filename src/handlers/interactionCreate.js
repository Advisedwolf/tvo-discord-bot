// src/handlers/interactionCreate.js
import { replyError } from "../utils/replyHelpers.js";
import { t } from "../utils/translator.js";

export default {
  name: "interactionCreate",
  async execute(client, interaction) {
    const env = process.env.NODE_ENV || "live";
    const locale = interaction.user?.locale || "en";

    const handlers = {
      slashHandler: client.slashHandler,
      buttonHandler:
        env === "test" ? client.testButtonHandler : client.buttonHandler,
      modalHandler:
        env === "test" ? client.testModalHandler : client.modalHandler,
      selectMenuHandler:
        env === "test"
          ? client.testSelectMenuHandler
          : client.selectMenuHandler,
      userContextMenuHandler: client.userContextMenuHandler,
      messageContextMenuHandler: client.messageContextMenuHandler,
    };

    try {
      if (interaction.isChatInputCommand()) {
        console.log(
          `[DEBUG] Slash command received: ${interaction.commandName}`,
        );
        if (!handlers.slashHandler) {
          return replyError(interaction, "error.handler_not_found", {
            type: t("slash.type", {}, locale),
          });
        }
        await handlers.slashHandler.handle(interaction);
      } else if (interaction.isButton()) {
        console.log(
          `[DEBUG] Button interaction received: ${interaction.customId}`,
        );
        if (!handlers.buttonHandler) {
          return replyError(interaction, "error.handler_not_found", {
            type: t("button.type", {}, locale),
          });
        }
        await handlers.buttonHandler.handle(interaction);
      } else if (interaction.isModalSubmit()) {
        console.log(`[DEBUG] Modal submit received: ${interaction.customId}`);
        if (!handlers.modalHandler) {
          return replyError(interaction, "error.handler_not_found", {
            type: t("modal.type", {}, locale),
          });
        }
        await handlers.modalHandler.handle(interaction);
      } else if (
        interaction.isStringSelectMenu() ||
        interaction.isUserSelectMenu() ||
        interaction.isRoleSelectMenu() ||
        interaction.isMentionableSelectMenu()
      ) {
        console.log(
          `[DEBUG] Select menu interaction received: ${interaction.customId}`,
        );
        if (!handlers.selectMenuHandler) {
          return replyError(interaction, "error.handler_not_found", {
            type: t("selectMenu.type", {}, locale),
          });
        }
        await handlers.selectMenuHandler.handle(interaction);
      } else if (interaction.isUserContextMenuCommand()) {
        console.log(
          `[DEBUG] User context menu command received: ${interaction.commandName}`,
        );
        if (!handlers.userContextMenuHandler) {
          return replyError(interaction, "error.handler_not_found", {
            type: t("userContextMenu.type", {}, locale),
          });
        }
        await handlers.userContextMenuHandler.handle(interaction);
      } else if (interaction.isMessageContextMenuCommand()) {
        console.log(
          `[DEBUG] Message context menu command received: ${interaction.commandName}`,
        );
        if (!handlers.messageContextMenuHandler) {
          return replyError(interaction, "error.handler_not_found", {
            type: t("messageContextMenu.type", {}, locale),
          });
        }
        await handlers.messageContextMenuHandler.handle(interaction);
      } else {
        console.log("[DEBUG] Unknown interaction type");
      }
    } catch (error) {
      // Log in English for diagnostics
      console.error("Error handling interaction:", error);
      // Localized, standardized error embed
      await replyError(interaction);
    }
  },
};
