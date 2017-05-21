const path = require('path');
const fs = require('fs');
const async = require('async');
const shell = require('shelljs');
const chokidar = require('chokidar');
const mkdirp = require('mkdirp');
const shellescape = require('shell-escape');

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
    console.log('start to watch upload and raw dir...');
    this.watcher.on('add', (filename) => {
      const uploadRegex = new RegExp(`.*${config.storage.dir.upload}.*\.(json)$`);
      const rawRegex = new RegExp(`.*${config.storage.dir.raw}.*\.(mp4|mkv)$`);

      if (uploadRegex.test(filename)) {
        setTimeout(() => {
          console.log('UPLOAD: ' + filename);
          doUploads.add(filename);
        }, config.automator.uploadDelay * 1000);
      } else if (rawRegex.test(filename)) {
        setTimeout(() => {
          console.log('RAW: ' + filename);
          runAnimeloopClis.add(filename);
        }, config.automator.animeloopCliDelay * 1000);
      }
    });
  }

  upload(jsonfile, callback) {
    let loops = parsing(jsonfile);

    if (loops == undefined) {
      console.error('loops undefined');
    }

    async.series(loops.map((loop) => {
      return (callback) => {
        this.alManager.addLoop(loop, callback);
      };
    }), (err) => {
      if (err != null && err != undefined) {
        console.error(err);
        return;
      }

      console.log('Add database end.');

      shell.rm('-r', path.dirname(jsonfile));

      if (callback) {
        callback();
      }
    });
  }

  animeloopCli(filename, callback) {
    let args = [config.animeloopCli.bin, '-i', filename, '--cover', '-o', config.storage.dir.autogen];
    let shellString = shellescape(args);

    console.log(shellString);
    shell.exec(shellString, () => {
      let basename = path.basename(filename, path.extname(filename));
      let dir = path.join(config.storage.dir.autogen, 'loops', basename);

      shell.mv(dir, config.storage.dir.upload);
      shell.rm(filename);

      if (callback) {
        callback();
      }
    });
  }
}

var automator = new Automator();


setInterval(() => {
  if (doingConvert || doingUpload || runningAnimeloopCli) {
    return;
  }

  if (shouldDoConvert) {
    doingConvert = true;
    convert();
    doingConvert = false;
    return;
  }

  if (doUploads.size != 0) {
    doingUpload = true;
    let filename = doUploads.values().next().value;
    automator.upload(filename, () => {
      doUploads.delete(filename);
      doingUpload = false;
      shouldDoConvert = true;
    });
    return;
  }

  if (runAnimeloopClis.size != 0) {
    runningAnimeloopCli = true;
    let filename = runAnimeloopClis.values().next().value;
    automator.animeloopCli(filename, () => {
      runAnimeloopClis.delete(filename);
      runningAnimeloopCli = false;
    });
    return;
  }
}, config.automator.pollingDuration * 1000);