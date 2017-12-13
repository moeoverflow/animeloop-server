/* eslint-disable no-useless-escape */
const Arena = require('bull-arena');
const express = require('express');
const basicAuth = require('basic-auth-connect');
const chokidar = require('chokidar');
const log4js = require('log4js');

const logger = log4js.getLogger('automator-watcher');
const config = require('../../config.js');
const Automator = require('./automator.js');

const automator = new Automator();

const watcher = chokidar.watch([config.storage.dir.upload, config.storage.dir.raw], {
  persistent: true,
  usePolling: true,
});
logger.info('Start to watch upload and raw dir...');

watcher.on('add', (filename) => {
  const uploadRegex = new RegExp(`.*${config.storage.dir.upload}.*\.(json)$`);
  const rawRegex = new RegExp(`.*${config.storage.dir.raw}.*\.(mp4|mkv)$`);

  if (uploadRegex.test(filename)) {
    automator.addUploadJob(filename);
  } else if (rawRegex.test(filename)) {
    automator.addAnimeloopCliJob(filename);
  }
});

const arena = Arena({
  queues: [{
    name: 'animeloop',
    port: config.redis.port,
    host: config.redis.host,
    hostId: 'Local',
    db: config.automator.redisN,
  }],
}, {
  port: config.automator.app.port,
  basePath: config.automator.app.url,
  disableListen: true,
});

const app = express();
app.use(basicAuth(config.automator.app.auth.username, config.automator.app.auth.password));
app.use('/', arena);
app.listen(config.automator.app.port, config.automator.app.host);
