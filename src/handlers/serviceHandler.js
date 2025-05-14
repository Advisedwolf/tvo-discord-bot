// src/handlers/serviceHandler.js
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const translator = require('../utils/translator');

/**
 * ServiceHandler
 * Automatically loads and manages your bot services.
 * Services should export a class with optional start() and stop() methods.
 */
module.exports = class ServiceHandler {
  constructor(client, options = {}) {
    this.client = client;
    this.servicesPath = options.servicesPath
      || path.join(__dirname, '..', 'Services');
    this.services = new Map();
  }

  /**
   * Recursively walks a directory and returns all file paths.
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
   * Loads all service classes and calls start() if provided.
   */
  async loadServices() {
    if (!fs.existsSync(this.servicesPath)) {
      logger.warn(
        translator.t('serviceHandler.noDir', { path: this.servicesPath }),
        'services'
      );
      return;
    }

    const files = this.walkDirectory(this.servicesPath)
      .filter(file => file.endsWith('.js'));

    for (const filePath of files) {
      try {
        const ServiceClass = require(filePath);
        const serviceInstance = new ServiceClass(this.client);

        if (typeof serviceInstance.start === 'function') {
          await serviceInstance.start();
          logger.debug(
            translator.t('serviceHandler.startService', { file: path.basename(filePath) }),
            'services'
          );
        }

        this.services.set(filePath, serviceInstance);
        logger.info(
          translator.t('serviceHandler.loadedService', { service: path.basename(filePath) }),
          'services'
        );
      } catch (error) {
        logger.error(
          translator.t('serviceHandler.failedLoad', {
            file: path.basename(filePath),
            error: error.message
          }),
          'services'
        );
      }
    }

    logger.info(
      translator.t('serviceHandler.totalLoaded', { count: this.services.size }),
      'services'
    );
  }

  /**
   * Stops all services by calling stop() if provided.
   */
  async stopServices() {
    for (const [filePath, serviceInstance] of this.services) {
      if (typeof serviceInstance.stop === 'function') {
        try {
          await serviceInstance.stop();
          logger.info(
            translator.t('serviceHandler.stoppedService', { service: path.basename(filePath) }),
            'services'
          );
        } catch (error) {
          logger.error(
            translator.t('serviceHandler.errorStopping', {
              file: path.basename(filePath),
              error: error.message
            }),
            'services'
          );
        }
      }
    }
  }
};
