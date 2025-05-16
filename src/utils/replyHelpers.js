// src/utils/replyHelpers.js
import { getService } from "../services/servicesRegistry.js";
import { createEmbed } from "../services/functions/embedService.js";
import { t } from "./translator.js";

/**
 * Send a standardized error embed to the user.
 *
 * @param {Interaction} interaction
 * @param {string}      errorKey     — translation key, e.g. 'error.generic'
 * @param {object}      [params]     — for translator interpolation
 */
export async function replyError(
  interaction,
  errorKey = "error.generic",
  params = {},
) {
  // 1) Localize the title & description
  const locale = interaction.user.locale || "en";
  const title = t("error.title", {}, locale); // e.g. "Error"
  const description = t(errorKey, params, locale); // e.g. "An unexpected error occurred"

  // 2) Build your error embed via your template service
  const embed = createEmbed("error", { title, description });

  // 3) Reply ephemeral so only the user sees
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({ embeds: [embed], flags: 64 });
  } else {
    await interaction.reply({ embeds: [embed], flags: 64 });
  }
}
