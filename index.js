// index.js (project root)
import 'dotenv/config';
import { createRequire } from 'module';
import path from 'path';
import { connectDB } from './src/models/db.js';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { loadCommands } from './src/handlers/commandHandler.js';
import { loadEventHandlers } from './src/handlers/eventsRegistry.js';
import { initScheduling } from './src/handlers/schedulingHandler.js';
import { replyError } from './src/utils/replyHelpers.js';
import { loadServices, getService } from './src/services/servicesRegistry.js';
import logger from './src/utils/logger.js';
import { t } from './src/utils/translator.js';

// 0) Env‐sanity check
const missing = ['DISCORD_TOKEN','MONGODB_URI','CLIENT_ID','GUILD_ID']
  .filter(k => !process.env[k]);
if (missing.length) {
  logger.error(`Missing ENV vars: ${missing.join(', ')}`);
  process.exit(1);
}

// 0.1) Bot name & version from package.json
const require = createRequire(import.meta.url);
const { name: BOT_NAME, version: BOT_VERSION } = require('./package.json');
logger.info(`▶ ${BOT_NAME} v${BOT_VERSION}`);

// 0.2) Catch unhandled rejections & exceptions
process
  .on('unhandledRejection', e => logger.error('UnhandledRejection:', e))
  .on('uncaughtException',  e => {
    logger.error('UncaughtException:', e);
    process.exit(1);
  });

async function main() {
  logger.info('index.js loading…');

  // 1) Connect to MongoDB
  await connectDB();
  logger.info('MongoDB connected');

  // 2) Load & register every service under src/services/**
  await loadServices();

  // 3) Instantiate Discord client
  const client = new Client({ intents: [ GatewayIntentBits.Guilds ] });
  client.commands = client.commands || new Map();

  // 4) Log Discord.js errors & warnings at the client level
  client
    .on('error', e => logger.error('[Discord.js] Client error:', e))
    .on('warn',  w => logger.warn('[Discord.js] Client warn:', w));

  // 5) Load & register slash commands
  await loadCommands(client);

  // 6) Load your button/modal/select/etc. handlers
  await loadEventHandlers(client);

  // 7) Wire up slash-command execution + permission guard
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    const permissionService = getService('admin/permissionservice');
    if (!(await permissionService.canExecute(interaction))) {
      return replyError(interaction, 'ERRORS.permissionDenied');
    }

    try {
     await cmd.execute(interaction);
    } catch (err) {
  logger.error(`/${interaction.commandName} execution error:`, err);

  if (err?.rawError?.errors) {
    logger.error('Discord API field errors:', err.rawError.errors);
  }
  await replyError(interaction, 'ERRORS.generic');
}
  });

  // 8) Initialize & stash your AssetService
  const assetServiceFactory = getService('admin/assetservice');
  client.assetService = assetServiceFactory(client);

  // 9) Kick off your scheduling loops (e.g. reminders)
  initScheduling(client);

  // 10) On ready: seed default permissions, then announce ready
  client.once(Events.ClientReady, async () => {
    const permissionService = getService('admin/permissionservice');
    // Attach Discord client for asset lookups
    permissionService.client = client;
    for (const guild of client.guilds.cache.values()) {
      await permissionService.seedDefaults(guild.id);
    }
    logger.info(t('LOG.botReady', { bot: client.user.tag }));
  });

  // 11) Finally, log in, log in
  await client.login(process.env.DISCORD_TOKEN);
}

main().catch(err => {
  logger.error('Startup error:', err);
  process.exit(1);
});

