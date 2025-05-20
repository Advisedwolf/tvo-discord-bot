// src/services/functions/inputService.js
import {
  ActionRowBuilder,
  StringSelectMenuBuilder
} from 'discord.js';
import { t } from '../../utils/translator.js';

/**
 * Builds dropdowns for selecting year, month, and day (split 1–25 & 26–31).
 */
export function getDateSelectors(defaultDate = new Date()) {
  // 1) Year options (e.g. now .. now+5)
  const currentYear = defaultDate.getUTCFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
  const yearMenu = new StringSelectMenuBuilder()
    .setCustomId('select_date_year')
    .setPlaceholder(t('UI.selectYear'))
    .addOptions(
      years.map(y => ({ label: `${y}`, value: `${y}` }))
    );

  // 2) Month options (1–12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthMenu = new StringSelectMenuBuilder()
    .setCustomId('select_date_month')
    .setPlaceholder(t('UI.selectMonth'))
    .addOptions(
      months.map(m => ({
        label: t(`MONTHS.${m}`),    // localized month name
        value: `${m}`
      }))
    );

  // 3a) Day 1–25
  const daysLow = Array.from({ length: 25 }, (_, i) => i + 1);
  const dayLowMenu = new StringSelectMenuBuilder()
    .setCustomId('select_date_day_low')
    .setPlaceholder(t('UI.selectDay'))
    .addOptions(
      daysLow.map(d => ({ label: `${d}`, value: `${d}` }))
    );

  // 3b) Day 26–31
  const daysHigh = Array.from({ length: 6 }, (_, i) => 26 + i);
  const dayHighMenu = new StringSelectMenuBuilder()
    .setCustomId('select_date_day_high')
    .setPlaceholder(t('UI.selectDay'))
    .addOptions(
      daysHigh.map(d => ({ label: `${d}`, value: `${d}` }))
    );

  // Wrap each menu in its own ActionRow
  const yearRow   = new ActionRowBuilder().addComponents(yearMenu);
  const monthRow  = new ActionRowBuilder().addComponents(monthMenu);
  const dayLowRow = new ActionRowBuilder().addComponents(dayLowMenu);
  const dayHighRow= new ActionRowBuilder().addComponents(dayHighMenu);

  return [yearRow, monthRow, dayLowRow, dayHighRow];
}

/**
 * Builds dropdowns for selecting hour and minute.
 */
export function getTimeSelectors(defaultDate = new Date()) {
  // Hour 0–23
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hourMenu = new StringSelectMenuBuilder()
    .setCustomId('select_time_hour')
    .setPlaceholder(t('UI.selectHour'))
    .addOptions(
      hours.map(h => ({ label: `${h}`, value: `${h}` }))
    );

  // Minute 0–59, stepping by 5 for brevity
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const minuteMenu = new StringSelectMenuBuilder()
    .setCustomId('select_time_minute')
    .setPlaceholder(t('UI.selectMinute'))
    .addOptions(
      minutes.map(m => ({ label: `${m}`, value: `${m}` }))
    );

  const hourRow   = new ActionRowBuilder().addComponents(hourMenu);
  const minuteRow = new ActionRowBuilder().addComponents(minuteMenu);
  return [hourRow, minuteRow];
}

export default { getDateSelectors, getTimeSelectors };

