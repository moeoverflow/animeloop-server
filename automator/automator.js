const path = require('path');
const fs = require('fs');
const async = require('async');
const shell = require('shelljs');
const watch = require('node-watch');
const mkdirp = require('mkdirp');
const shellescape = require('shell-escape');

const config = require('../config');
const ALManager = require('../manager/almanager');
const parsing = require('./parse');
const convert = require('./converter');

var uploadTimer;
var animeloopCliTimer;
var doUploads = new Set();
var runAnimeloopCli = new Set();


class Automator {
  constructor() {
    this.alManager = new ALManager();
    this.databaseHandler = this.alManager.databaseHandler;

    this.watchingUploadDir();
    this.watchingRawDir();
  }


  watchingUploadDir() {
    console.log('start to watch upload dir...');

    var watcher = watch(config.storage.dir.upload, {
      recursive: true,
      filter: /\.json$/,
    });
    watcher.on('change', (event, filename) => {
      if (event == 'update') {
        if (doUploads.has(filename)) {
          return;
        }
        doUploads.add(filename);

        clearTimeout(uploadTimer)
        uploadTimer = setTimeout(() => {
          async.waterfall(Array.from(doUploads).map((filename) => {
            return (callback) => {
              this.upload(filename, () => {
                doUploads.delete(filename);
                callback();
              });
            };
          }), (err) => {
            if (err != null && err != undefined) {
              console.error(err);
              return;
            }

            convert();
          });
        }, config.automator.delay * 1000);
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

  watchingRawDir() {
    console.log('start to watch raw dir...');
    var watcher = watch(config.storage.dir.raw, {
      recursive: true,
      filter: /\.(mp4|mkv)$/,
    });
    watcher.on('change', (event, filename) => {
      if (event == 'update') {
        if (runAnimeloopCli.has(filename)) {
          return;
        }
        runAnimeloopCli.add(filename);

        clearTimeout(animeloopCliTimer)
        animeloopCliTimer = setTimeout(() => {
          async.series(Array.from(runAnimeloopCli).map((filename) => {
            return (callback) => {
              this.runAnimeloopCli(filename, () => {
                runAnimeloopCli.delete(filename);
                shell.rm(filename);
                callback();
              });
            };
          }));
        }, config.automator.delay * 1000);
      }
    });
  }

  runAnimeloopCli(filename, callback) {
    let args = [config.animeloopCli.bin, '-i', filename, '--cover', '-o', config.storage.dir.autogen];
    let shellString = shellescape(args);

    console.log(shellString);
    shell.exec(shellString, () => {
      let basename = path.basename(filename, path.extname(filename));
      let dir = path.join(config.storage.dir.autogen, 'loops', basename);
      this.upload(path.join(dir, basename + '.json'), () => {
        convert();
      });

      if (callback) {
        callback();
      }
    });
  }
}

var automator = new Automator();