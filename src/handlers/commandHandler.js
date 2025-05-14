// src/handlers/commandHandler.js
const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const translator = require('../utils/translator');

/**
 * CommandHandler
 * Recursively loads slash commands and registers them on the client.
 */
module.exports = class CommandHandler {
  constructor(client, options = {}) {
    this.client = client;
    this.commandsPath = options.commandsPath
      || path.join(__dirname, '..', 'commands');
    this.client.commands = new Collection();
  }

  /**
   * Recursively gets all file paths in a directory.
   * @param {string} dir
   * @returns {string[]}
   */
  walkDirectory(dir) {
    return fs.readdirSync(dir, { withFileTypes: true })
      .flatMap(entry => {
        const fullPath = path.join(dir, entry.name);
        return entry.isDirectory()
          ? this.walkDirectory(fullPath)
          : [fullPath];
      });
  }

  /**
   * Loads and registers commands.
   */
  async loadCommands() {
    if (!fs.existsSync(this.commandsPath)) {
      logger.warn(
        translator.t('commandHandler.noDir', { path: this.commandsPath }),
        'commands'
      );
      return;
    }

    const files = this.walkDirectory(this.commandsPath)
      .filter(file => file.endsWith('.js'));

    for (const filePath of files) {
      try {
        const command = require(filePath);
        if (command.data && typeof command.execute === 'function') {
          this.client.commands.set(command.data.name, command);
          logger.info(
            translator.t('commandHandler.loaded', { name: command.data.name }),
            'commands'
          );
        } else {
          logger.warn(
            translator.t('commandHandler.invalidFile', { file: path.basename(filePath) }),
            'commands'
          );
        }
      } catch (error) {
        logger.error(
          translator.t('commandHandler.failedLoad', {
            file: path.basename(filePath),
            error: error.message
          }),
          'commands'
        );
      }
    }

    logger.info(
      translator.t('commandHandler.totalLoaded', { count: this.client.commands.size }),
      'commands'
    );
  }
};