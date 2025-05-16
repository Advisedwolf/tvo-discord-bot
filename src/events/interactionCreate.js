// src/handlers/interactionCreate.js
import { replyError } from "../utils/replyHelpers.js";
import { t } from "../utils/translator.js";

export default {
  name: "interactionCreate",
  async execute(client, interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        console.log(`[DEBUG] Received command: ${interaction.commandName}`);
        console.log(
          `[DEBUG] Commands loaded: ${Array.from(client.commands.keys()).join(", ")}`,
        );

        const command = client.commands.get(interaction.commandName);
        if (!command) {
          console.log(`[WARN] Command not found: ${interaction.commandName}`);
          await interaction.reply({
            content: t("error.command_not_found"),
            flags: 64,
          });
          return;
        }

        await command.execute(interaction);
        console.log(
          `[INFO] Successfully executed command: ${interaction.commandName}`,
        );
      } else if (interaction.isButton()) {
        console.log(
          `[DEBUG] Button interaction received: ${interaction.customId}`,
        );
        if (!client.buttonHandler) {
          console.log("[WARN] Button handler not found");
          await interaction.reply({
            content: t("error.handler_not_found", { type: "button" }),
            flags: 64,
          });
          return;
        }
        await client.buttonHandler.handle(interaction);
        console.log("[INFO] Button interaction handled");
      } else if (interaction.isModalSubmit()) {
        console.log(`[DEBUG] Modal submit received: ${interaction.customId}`);
        if (!client.modalHandler) {
          console.log("[WARN] Modal handler not found");
          await interaction.reply({
            content: t("error.handler_not_found", { type: "modal" }),
            flags: 64,
          });
          return;
        }
        await client.modalHandler.handle(interaction);
        console.log("[INFO] Modal interaction handled");
      } else if (interaction.isStringSelectMenu()) {
        console.log(
          `[DEBUG] Select menu interaction received: ${interaction.customId}`,
        );
        if (!client.selectMenuHandler) {
          console.log("[WARN] Select menu handler not found");
          await interaction.reply({
            content: t("error.handler_not_found", { type: "select menu" }),
            flags: 64,
          });
          return;
        }
        await client.selectMenuHandler.handle(interaction);
        console.log("[INFO] Select menu interaction handled");
      } else if (interaction.isUserContextMenuCommand()) {
        console.log(
          `[DEBUG] User context menu received: ${interaction.commandName}`,
        );
        if (!client.userContextMenuHandler) {
          console.log("[WARN] User context menu handler not found");
          await interaction.reply({
            content: t("error.handler_not_found", {
              type: "user context menu",
            }),
            flags: 64,
          });
          return;
        }
        await client.userContextMenuHandler.handle(interaction);
        console.log("[INFO] User context menu interaction handled");
      } else if (interaction.isMessageContextMenuCommand()) {
        console.log(
          `[DEBUG] Message context menu received: ${interaction.commandName}`,
        );
        if (!client.messageContextMenuHandler) {
          console.log("[WARN] Message context menu handler not found");
          await interaction.reply({
            content: t("error.handler_not_found", {
              type: "message context menu",
            }),
            flags: 64,
          });
          return;
        }
        await client.messageContextMenuHandler.handle(interaction);
        console.log("[INFO] Message context menu interaction handled");
      } else {
        console.log("[DEBUG] Unknown interaction type");
      }
    } catch (error) {
      // Always log in English for debugging
      console.error("Error handling interaction:", error);
      // Use standardized, localized error reply
      await replyError(interaction);
    }
  },
};
