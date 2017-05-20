const path = require('path');
const fs = require('fs');
const async = require('async');
const shell = require('shelljs');
const watch = require('node-watch');
const mkdirp = require('mkdirp');

const config = require('../config');
const ALManager = require('../manager/almanager');
const parsing = require('./parse');
const convert = require('./converter');

var uploadTimer;
var doUploads = new Set();


class Automator {
  constructor() {
    this.alManager = new ALManager();
    this.databaseHandler = this.alManager.databaseHandler;

    this.watchingUploadDir();
  }


  watchingUploadDir() {
    console.log('start to watch upload dir...');
    watch(config.storage.dir.upload, {
      recursive: true,
      filter: /\.json$/,
    }, (event, filename) => {
      if (event == 'update') {
        if (doUploads.has(filename)) {
          return;
        }
        doUploads.add(filename);

        clearTimeout(uploadTimer)
        uploadTimer = setTimeout(() => {
          async.series(Array.from(doUploads).map((filename) => {
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
        }, config.storage.uploadDelay * 1000);
      }
    });
  }

  upload(jsonfile, callback) {
    let loops = parsing(jsonfile);

    if (loops == undefined) {
      console.error('loops undefined');
    }

    async.waterfall(loops.map((loop) => {
      return (callback) => {
        this.alManager.addLoop(loop, callback);
      }
    }), (err) => {
      if (err != null && err != undefined) {
        console.error(err);
        return;
      }

      console.log('Add database end.');

      shell.rm('-r', path.dirname(jsonfile));
      callback();
    });
  }

  watchingRawDir() {
    console.log('start to watch raw dir...');
    watch(config.storage.dir.raw, {
      recursive: true,
      filter: /\.(mp4|mkv)$/,
    }, (event, filename) => {
      if (event == 'update') {
        if (this.uploads.has(filename)) {
          return;
        }

        setTimeout(() => {
          console.log('NEW FILE: ' + filename);

        }, config.storage.uploadDelay * 1000);
      }
    });
  }
}

var automator = new Automator();