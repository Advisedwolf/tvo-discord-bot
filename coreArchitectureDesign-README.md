📘 Core Architecture & Design Principles for TVO Discord Bot

Last Updated: May 14, 2025

🔹 1. Embed Handling (Template Posts)

All reusable embed messages are stored in /constants/embedTemplates/

Structured by module (e.g., onboarding.js, events.js, etc.)

Translations are injected dynamically via the translator.t() function

Embed keys are matched in handler logic and passed to Discord as embed objects

Usage Pattern:

const onboardingEmbeds = require('../constants/embedTemplates/onboarding');
const embed = onboardingEmbeds.vows(locale);

🔹 2. Central Logging Logic

Logger is accessed via utils/logger.js

Supports levels: info, debug, warn, error

Each log includes category context (e.g., 'commands', 'interaction')

Usage Pattern:

logger.debug(`Action performed by ${user.tag}`, 'commands');
logger.error(`Failed to fetch data: ${err.message}`, 'services');

🔹 3. Central Command & Services Architecture

All commands live in /commands/

Services for command logic live in /services/

Modular service files support onboarding steps, scheduling, alerts, etc.

Use pattern is split: commands handle interaction.deferReply() and reply(), services handle business logic

🔹 4. Translation (i18n)

Translation files stored in /config/ as JSON (en.json, fr.json, etc.)

Translation handled via translator.t(key, locale, params)

All user-facing content must use a translation key

Usage Example:

const response = translator.t('onboarding.askAgeRange.title', locale);

🔹 5. MongoDB Data Persistence

MongoDB Atlas connection string stored in .env

Database operations handled via mongoose

Models located in /models/ (e.g., UserProfile.js, CBSPFarm.js)

Onboarding answers and profile data saved persistently

Sample Usage:

await UserProfile.updateOne(
{ userId: interaction.user.id },
{ $set: { language: selected } },
{ upsert: true }
);

🔹 6. Command & Interaction Routing

All routing for interactionCreate handled in /events/interactionCreate.js

Routes slash commands, button interactions, select menus, and modals

New interactions must be registered in this file

🔹 7. Channel & Role IDs

IDs for channels/threads stored in /config/channels.js

Role IDs stored in /config/roleIDs.js

Reference dynamically in services or embed builders to prevent hardcoding

🔹 8. Precommit Hooks and Linting

Uses eslint, prettier, and husky for code quality

lint-staged ensures all commits are validated before push

Lint configuration stored in eslint.config.js

🔹 9. GitHub & Repo Protections

Secrets scanning enabled via GitHub Push Protection

.env excluded and scrubbed from history using filter-repo

.gitignore includes all build and sensitive files

🧠 Future Reminders

All new services must:

Log with logger

Handle i18n via translator

Validate or store data in MongoDB as needed

Avoid hardcoding channels/roles — always use config

Register any interactions (modals/selects/buttons) in interactionCreate

Keep this file updated to ensure future collaborators and modules follow our architecture.
