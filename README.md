# TVO Discord Bot

## Overview

The TVO Discord Bot is a comprehensive, modular bot developed for the TVO alliance community. It integrates deeply with Discord’s features to enhance engagement, coordination, and operational efficiency across several domains including onboarding, events, alerts, leadership, and more.

## Key Features

### 🛡 Shield Scheduling
- Interactive DM-based flow to schedule protection shields.
- Localized prompts using translation files.
- MongoDB-backed storage and cleanup scheduling.

### 📅 Event Management
- Support for Discord Scheduled Events integration.
- Interactive button-based creation, attendance tracking, and editing.
- Daily summaries, countdown reminders, and thread discussions.
- Clean, localized embed posts with timezone support.

### 🧭 Leadership Agenda System
- Add and track leadership tasks using modals and slash commands.
- Track status, assignment, priority, and categories.
- Automated reminders and leadership score tracking (planned).

### 🧑 Onboarding System
- DM-based flow to collect country, timezone, gaming experience, and more.
- Role assignment and alert subscription.
- Multi-language support.

### 📣 Alerts & CBSP Management
- Interactive role subscriptions via buttons.
- Tailored prompts and confirmation flows.

### 🧵 Reaction Handlers
- Role-based message reactions and removals.
- Synced with Discord roles and channel behavior.

## Architecture

- **Commands**: Located in `/commands/`
- **Event Handlers**: Managed via `/events/`
- **Services**: Core logic in `/services/`
- **Models**: MongoDB schemas under `/models/`
- **Localization**: JSON files in `/config/` like `en.json`
- **Utilities**: Logger, translator, and cleanup scheduler in `/utils/`

## Logging & Debugging

All core modules use a centralized `logger.js` for structured logging:
- `.info()`, `.debug()`, `.error()` methods available.
- Scoped by feature for easy tracing.

## Setup

1. Clone the repository
2. Configure `.env` with your bot token, Mongo URI, and IDs.
3. Run `node deploy-commands.js` to register commands.
4. Start the bot with `node index.js`

## Roadmap

- 📌 Task dashboards for leadership
- 🗓 Flexible event recurrence rules
- 🌐 User preferences for DM summaries
- 📊 Advanced metrics and scoring

## Contributing

Modular and scalable design ensures easy contribution. Follow our structure and use localized strings for all prompts.

---

Built with ❤️ for the TVO community.