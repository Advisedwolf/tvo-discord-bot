# Bot Architecture Overview

This document provides a high-level view of the bot's core architecture, illustrating how the main components interact from startup through command execution and data persistence.

---

## 1. Startup Sequence

```text
.env load & validation
        ↓
   MongoDB connect
        ↓
 loadServices()  ───► src/services/**/*.js
        ↓
Instantiate Discord Client
        ↓
 registerHandlers() ──► Commands, Events, Scheduling
        ↓
  initScheduling()   ──► cron & intervals
        ↓
  client.login()     → Discord Gateway
        ↓
ClientReady event → seedDefaults (permissions) → sync assets → start polling
```

- **.env & Config**: Load environment variables (`DISCORD_TOKEN`, `MONGODB_URI`, etc.) and JSON configs (permissions, locales).
- **DB Connection**: Establish Mongoose connection to MongoDB.
- **Service Registration**: Auto-discover and register all modules under `src/services` via `servicesRegistry.js`.
- **Discord Client**: Create the `Client` with desired intents and attach global error/warn listeners.
- **Handler Registration**:
  - **Command Registry**: `commandHandler.js` traverses `src/commands` and registers slash commands.
  - **Event Registry**: `eventsRegistry.js` loads listeners from `src/handlers/events`.
  - **Scheduling Handler**: `schedulingHandler.js` sets up cron jobs and intervals.
- **Client Login**: Authenticate with Discord and open WebSocket connection.
- **Ready Tasks**: On `ClientReady`, seed default permissions, sync Discord assets to DB, start reminder polling, and log readiness.

---

## 2. Interaction Flow

```text
Discord User Interaction
        ↓
 interactionCreate event (src/handlers/interactionCreate.js)
        ↓
 Load UserProfile (locale, preferences)
        ↓
 Permission Check ──► permissionService.canExecute()
        ↓
 Dispatch to Handler
  • Slash Command → slashHandler.handle()
  • Button       → buttonHandler.handle()
  • Modal Submit → modalHandler.handle()
  • Select Menu  → selectMenuHandler.handle()
        ↓
 Execute business logic in module
        ↓
 replySuccess / replyError (localized via translator and replyHelpers)
        ↓
 Discord API Response
```

- **UserProfile Load**: Attach per-user settings (e.g. locale override) for translations.
- **Permission Guard**: Ensures command access based on DB-stored profiles.
- **Command Handlers**: Modular `execute()` functions in `src/commands` or respective handler folders.
- **Centralized Reply**: Use `replySuccess` / `replyError` to send consistent, localized embeds.

---

## 3. Data Persistence

- **PermissionProfile** (`src/models/PermissionProfile.js`)
  - Stores a `Map` of command names to arrays of role IDs.
  - Seeded from `config/permissions.json` and updated at runtime by `/perms` commands.

- **UserProfile** (`src/models/UserProfile.js`)
  - Stores per-user preferences such as `locale` overrides.
  - Upserted on first interaction or via `/settings locale`.

- **Assets & Reminders** (`assetService`, `reminderService`)
  - AssetService caches Discord channel/thread/role IDs in Mongo.
  - ReminderService persists scheduled reminders and polls for due notifications.

---

## 4. Utilities & Cross-Cutting Concerns

- **logger.js**: Emoji-enhanced, leveled logging (ℹ️, ⚠️, ❌).
- **translator.js**: Dynamic locale loader, region normalization, fallback to English.
- **replyHelpers.js**: Central reply functions that apply locale resolution, embed creation, and ephemeral flags.
- **servicesRegistry.js**: Auto-discovery of service modules and DI container.

---

> This architecture is designed for modularity and scalability: adding a new command, event, or service typically requires **only** dropping a file into the appropriate folder and restarting the bot, with no changes to the core framework.
