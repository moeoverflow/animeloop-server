const fs = require('fs');
const path = require('path');
const debug = require('debug')('backend');
const DBManager = require('./database');
const uuidV1 = require('uuid/v1');

class Processor {
  constructor(rawDataDir, dataDir, processDelay, database) {
    this.rawDataDir   = rawDataDir;
    this.dataDir      = dataDir;
    this.processDelay = processDelay || 3;
    this.database     = database;
    this.set          = new Set();
  }

  start() {
    fs.watch(this.rawDataDir, {recursive: true},  (eventType, filename) => {
      // debug(`EventType: ${eventType} For: ${filename}`);
      if (filename && path.extname(filename) === ".json") {
        const jsonDir = path.join(this.rawDataDir, filename);

        // Filter unnecessary events
        if (this.set.has(jsonDir)) { return; }
        this.set.add(jsonDir);

        // Delay for coping files or something
        setTimeout(this.process.bind(this), this.processDelay * 1000, jsonDir);
      }
    });
  }
  process(jsonDir) {
    fs.readFile(jsonDir, (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          this.set.delete(jsonDir);
          return debug(`${jsonDir} not exist, stop processing`);
        } else {
          throw err;
        }
      }

      let info = JSON.parse(data),
         loops = info.loops;

      Promise
      .all(loops.map((loop) => {
        let dir = path.dirname(jsonDir);
        let coverFilename = path.join(dir, loop.cover_filename);
        let videoFilename = path.join(dir, loop.video_filename);

        let newCoverFilename = path.join(this.dataDir, uuidV1() + path.extname(coverFilename));
        let newVideoFilename = path.join(this.dataDir, uuidV1() + path.extname(videoFilename));

        let p1 = moveMedia(coverFilename, newCoverFilename);
        let p2 = moveMedia(videoFilename, newVideoFilename);

        loop.cover_filename = newCoverFilename;
        loop.video_filename = newVideoFilename;

        return Promise.all([p1, p2]);

        function moveMedia(filename, newFilename) {
          return new Promise((resolve, reject) => {
            fs.rename(filename, newFilename, (err) => {
              if (err) {
                if (err.code == 'ENOENT') {
                  debug(`${filename} not exist`);
                  resolve(false);
                }
                reject(err);
              }
              resolve(true);
            });
          })
        }
      }))
      .then((results) => {
        debug(`File moving results: ${results}`);
        console.log(`All images and videos for ${info.title} are moved, writing to database...`);
        // Delete not existed file in json
        results.forEach((ele, i) => {
          if (ele[0] === true && ele[1] === true) {
            loops[i].exists = true;
          }
        });
        info.loops = loops.filter(loop => loop.exists);
        debug(`Loops left: ${info.loops}`)
        // Insert into DB
        DBManager.insertLoops({jsonDir: jsonDir, json: info});

        return new Promise((resolve, reject) => {
          fs.rename(jsonDir, path.join(this.dataDir, path.basename(jsonDir)), (err) => {
            if (err) throw err;
            resolve();
          });
        });
      }, err => console.error(err))
      .then(() => {
        // TODO remove empty folders
        debug(`${info.title} moved`);
      }, err => console.error(err));

      // Remove event from set
      this.set.delete(jsonDir);
    });
  }
}

module.exports = Processor;
