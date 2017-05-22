const path = require('path');
const fs = require('fs');
const async = require('async');
const shell = require('shelljs');
const chokidar = require('chokidar');
const mkdirp = require('mkdirp');
const shellescape = require('shell-escape');
const log4js = require('log4js');
const logger = log4js.getLogger('automator');

const config = require('../config');
const ALManager = require('../manager/almanager');
const parsing = require('./parse');
const convert = require('./converter');

var doUploads = new Set();
var runAnimeloopClis = new Set();

var shouldDoConvert = false;
var doingConvert = false;
var doingUpload = false;
var runningAnimeloopCli = false;

class Automator {
  constructor() {
    this.alManager = new ALManager();
    this.databaseHandler = this.alManager.databaseHandler;

    this.watching();
  }


  watching() {
    this.watcher = chokidar.watch([config.storage.dir.upload, config.storage.dir.raw], {
      persistent: true,
      usePolling: true
    });
    logger.info('Start to watch upload and raw dir...');
    this.watcher.on('add', (filename) => {
      const uploadRegex = new RegExp(`.*${config.storage.dir.upload}.*\.(json)$`);
      const rawRegex = new RegExp(`.*${config.storage.dir.raw}.*\.(mp4|mkv)$`);

      if (uploadRegex.test(filename)) {
        setTimeout(() => {
          logger.info(`Upload dir new file: ${path.basename(filename)}`);
          doUploads.add(filename);
        }, config.automator.uploadDelay * 1000);
      } else if (rawRegex.test(filename)) {
        setTimeout(() => {
          logger.info(`Raw dir new file: ${path.basename(filename)}`);
          runAnimeloopClis.add(filename);
        }, config.automator.animeloopCliDelay * 1000);
      }
    });
  }

  upload(jsonfile, callback) {
    let loops = parsing(jsonfile);
    if (loops == undefined) {
      logger.error('uploading loops undefined');
      return;
    }

    async.series(loops.map((loop) => {
      return (callback) => {
        this.alManager.addLoop(loop, callback);
      };
    }), (err) => {
      if (err != null && err != undefined) {
        logger.error(err);
        return;
      }
      shell.rm('-r', path.dirname(jsonfile));
      logger.error('Upload loops successfully.');

      if (callback) {
        callback();
      }
    });
  }

  animeloopCli(filename, callback) {
    let args = [config.animeloopCli.bin, '-i', filename, '--cover', '-o', config.storage.dir.autogen];
    let shellString = shellescape(args);
    logger.debug(`run command: ${shellString}`);
    shell.exec(shellString, () => {
      let basename = path.basename(filename, path.extname(filename));
      let dir = path.join(config.storage.dir.autogen, 'loops', basename);

      logger.debug(`move dir ${dir} to upload dir`);
      shell.mv(dir, config.storage.dir.upload);
      logger.debug(`delete file ${path.basename(filename)}.`);
      shell.rm(filename);

      if (callback) {
        callback();
      }
    });
  }
}

var automator = new Automator();


setInterval(() => {
  if (doingConvert || doingConvert || runningAnimeloopCli) {
    return;
  }

  if (shouldDoConvert) {
    logger.debug('polling: start to do convert.');
    doingConvert = true;
    convert();
    logger.debug('polling: do convert successfully.');
    doingConvert = false;
    shouldDoConvert = false;
    return;
  }

  if (doUploads.size != 0) {
    doingUpload = true;
    let filename = doUploads.values().next().value;
    logger.debug(`polling: start to do upload. file: ${path.basename(filename)}`);
    automator.upload(filename, () => {
      logger.debug(`polling: do upload successfully. file: ${path.basename(filename)}`);
      doUploads.delete(filename);
      doingUpload = false;
      shouldDoConvert = true;
    });
    return;
  }

  if (runAnimeloopClis.size != 0) {
    runningAnimeloopCli = true;
    let filename = runAnimeloopClis.values().next().value;
    logger.debug(`polling: start to run animeloop-cli. file: ${path.basename(filename)}`);
    automator.animeloopCli(filename, () => {
      logger.debug(`polling: run animeloop-cli successfully. file: ${path.basename(filename)}`);
      runAnimeloopClis.delete(filename);
      runningAnimeloopCli = false;
    });
    return;
  }
}, config.automator.pollingDuration * 1000);