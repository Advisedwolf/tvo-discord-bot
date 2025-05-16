// src/commands/testping.js
import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("testping")
  .setDescription("Responds with pong for testing.");

export async function execute(interaction) {
  console.log("[TESTPING] Command executed by:", interaction.user.tag);
  await interaction.reply({ content: "pong", ephemeral: true });
}
