# Getting Started

This guide will help you clone, configure, and run the bot locally.

## Prerequisites

- **Node.js** v18 or later
- **npm** (comes with Node.js)
- **MongoDB** access (Atlas URI or local instance)
- **Discord Application** with a Bot Token and a Test Guild

## 1. Clone the repository

```bash
git clone https://github.com/your-org/your-bot-repo.git
git checkout main
cd your-bot-repo
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

1. Copy the example `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set:
   - `DISCORD_TOKEN` – your bot token
   - `MONGODB_URI` – your MongoDB connection string
   - `CLIENT_ID` – your Discord Application ID
   - `GUILD_ID` – your test guild/server ID

```text
# .env
DISCORD_TOKEN=your_discord_bot_token
MONGODB_URI=your_mongo_uri
CLIENT_ID=your_app_id
GUILD_ID=your_guild_id
``` 

## 4. (Optional) Reset permissions database

If you’ve run this bot before and want a clean slate:

```bash
node resetPermissions.js
```

This drops the permission profiles collection and will re-seed defaults on startup.

## 5. Deploy slash commands

Before the bot can respond to slash commands, register them with Discord:

```bash
npm run deploy-commands
```

You should see output indicating commands were registered successfully.

## 6. Start the bot

```bash
npm start
``` 

You should see logs like:

```
▶ your-bot-name v1.0.0
index.js loading…
MongoDB connected
[servicesRegistry] Loaded 3 services
[commandHandler] Registered 5 commands
[eventsRegistry] Registered 4 events
[schedulingHandler] Scheduling tasks initialized
[permissionService] Seeded defaults for guild 123456789
[LOG.botReady] your-bot-tag
```

## 7. Test a command

In your Discord test guild, run `/ping`. You should receive a localized response.

---

You’re now ready to develop and extend the bot! Check out the [Architecture Overview](architecture.md) for details on the internals, and consult [Contributing](contributing.md) for guidelines on adding features. Enjoy coding!
