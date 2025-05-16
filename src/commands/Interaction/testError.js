// src/commands/Interaction/testError.js
import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("testerror")
  .setDescription("Intentionally throws an error to test error handling");

export async function execute(interaction) {
  throw new Error("This is a deliberate test error");
}
