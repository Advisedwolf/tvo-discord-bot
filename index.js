// index.js
import 'dotenv/config'; // loads .env
import { connectDB } from './src/models/db.js'; // MongoDB connector
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import slashHandler from './src/handlers/slashHandler.js';
import buttonHandler from './src/handlers/buttonHandler.js';
import selectMenuHandler from './src/handlers/selectMenuHandler.js';
import modalHandler from './src/handlers/modalHandler.js';
import userContextMenuHandler from './src/handlers/userContextMenuHandler.js';
import messageContextMenuHandler from './src/handlers/messageContextMenuHandler.js';
import testSlashHandler from './tests/handlers/testSlashHandler.js';
import testButtonHandler from './tests/handlers/testButtonHandler.js';
import testSelectMenuHandler from './tests/handlers/testSelectMenuHandler.js';
import testModalHandler from './tests/handlers/testModalHandler.js';
import testUserContextMenuHandler from './tests/handlers/testUserContextMenuHandler.js';
import testMessageContextMenuHandler from './tests/handlers/testMessageContextMenuHandler.js';
import { loadCommands } from './src/handlers/commandHandler.js';
import logger from './src/utils/logger.js';
import { replyError } from './src/utils/replyHelpers.js';

const env = process.env.NODE_ENV || 'live';
console.log(`Environment: ${env}`);

async function main() {
  // 1) Connect to your MongoDB before anything else
  await connectDB();

  // 2) Instantiate Discord client
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  });

  // 3) Wire up handlers based on environment
  if (env === 'test') {
    client.slashHandler = testSlashHandler;
    client.buttonHandler = testButtonHandler;
    client.selectMenuHandler = testSelectMenuHandler;
    client.modalHandler = testModalHandler;
    client.userContextMenuHandler = testUserContextMenuHandler;
    client.messageContextMenuHandler = testMessageContextMenuHandler;
  } else {
    client.slashHandler = slashHandler;
    client.buttonHandler = buttonHandler;
    client.selectMenuHandler = selectMenuHandler;
    client.modalHandler = modalHandler;
    client.userContextMenuHandler = userContextMenuHandler;
    client.messageContextMenuHandler = messageContextMenuHandler;
  }

  console.log('Slash Handler loaded:', !!client.slashHandler);
  console.log('Button Handler loaded:', !!client.buttonHandler);
  console.log('Select Menu Handler loaded:', !!client.selectMenuHandler);
  console.log('Modal Handler loaded:', !!client.modalHandler);
  console.log('User Context Menu Handler loaded:', !!client.userContextMenuHandler);
  console.log('Message Context Menu Handler loaded:', !!client.messageContextMenuHandler);

  // 4) Delegate interactions
  client.on('interactionCreate', async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        await client.slashHandler.handle(interaction);
      } else if (interaction.isButton()) {
        await client.buttonHandler.handle(interaction);
      } else if (interaction.isStringSelectMenu()) {
        await client.selectMenuHandler.handle(interaction);
      } else if (interaction.isModalSubmit()) {
        await client.modalHandler.handle(interaction);
      } else if (interaction.isUserContextMenuCommand()) {
        await client.userContextMenuHandler.handle(interaction);
      } else if (interaction.isMessageContextMenuCommand()) {
        await client.messageContextMenuHandler.handle(interaction);
      }
    } catch (err) {
      // English logging for debugging
      console.error('Error handling interaction:', err);
      // Localized error response for the user
      await replyError(interaction);
    }
  });

  // 5) Load commands and login
  try {
    await loadCommands(client, env);
    await client.login(process.env.DISCORD_TOKEN);
    logger.info(`[startup] ✅ Bot logged in as ${client.user.tag}`);
  } catch (err) {
    logger.error(`[startup] Error starting bot: ${err.message}`, 'startup');
    process.exit(1);
  }

  // 6) Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`, 'runtime');
  });
}

// Kick it all off
main();
