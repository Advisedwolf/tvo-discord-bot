Centralized Date & Time Picker Architecture
This document outlines the design and implementation of our reusable, horizontal Date/Time Picker services and handlers. These components can be leveraged by any command needing structured, localized date & time input.

1. Overview
Goal: Replace brittle free-text date/time inputs with a step-by-step, component-based wizard using Discord’s select menus.

Scope:

Build once under src/services/functions and src/handlers

Call from any command with a simple API

2. Components
a. InputService
Location: src/services/functions/inputService.js

Exports:

getDateSelectors(defaultDate?: Date): ActionRowBuilder[]
Year dropdown (current → +5 years)
Month dropdown (1–12, localized)
Day dropdowns split into 1–25 and 26–31
getTimeSelectors(defaultDate?: Date): ActionRowBuilder[]
Hour dropdown (0–23)
Minute dropdown (0, 5, 10…55)

b. DateTimePickerService
Location: src/services/functions/dateTimePickerService.js

API:

pickDateTime(
  interaction: CommandInteraction,
  options: { prompt: string; defaultDate?: Date }
): Promise<Date>
Flow:

deferReply({ flags: 64 })

Send initial reply with year selector

Create a MessageComponentCollector on that reply

On each collect:

select_date_year → swap to month
select_date_month → swap to both day rows
select_date_day_low/_day_high → swap to hour
select_time_hour → swap to minute
select_time_minute → update() clears components and resolve(UTC Date)
Collector times out (2 min) → reject(new Error('Date/time picker timed out'))

c. Handler Cleanup
Global router: src/handlers/selectMenuHandler.js

if (id.startsWith('select_date_') || id.startsWith('select_time_')) {
  return; // let DateTimePickerService’s collector handle it
}
// …otherwise route to commands or error…
Ensures component events for date/time never fall through to slash-command fallbacks.

3. Integration in Commands

// src/commands/Scheduler/remind.js
await interaction.deferReply({ flags: 64 });
const pickedDate = await dateTimePicker.pickDateTime(interaction, {
  prompt: t('COMMANDS.remind.pickDateTime'),
  defaultDate: new Date()
});
// …schedule with reminderService…
Minimal boilerplate: commands only define static options (category, message) and call pickDateTime.

4. Localization (i18n)
All user-facing strings live in src/config/locales/en.json:

"UI": {
  "selectYear": "Year…",
  "selectMonth": "Month…",
  "selectDay": "Day…",
  "selectHour": "Hour…",
  "selectMinute": "Minute…"
},
"COMMANDS": {
  "remind": {
    "pickDateTime": "📅 Pick a date and ⏰ time for your reminder",
    "pickYear": "📅 Select a year",
    // …other prompts…
  }
}
The translator (src/utils/translator.js) resolves nested keys and falls back to defaults when missing.

5. Error Handling
Collector errors (timeout or internal) reject the promise—commands catch and call replyError.

Global handlers no longer catch component interactions, preventing double-ack “Unknown interaction” errors.

6. Extensibility
Recurrence: Add a “Recurrence” dropdown step after minute.

Time zones: Enhance to let users pick or auto-detect time zone.

Modals: Swap out day selection for a modal if desired.

