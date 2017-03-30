const   fs  = require('fs'),
      path  = require('path'),
      debug = require('debug')('backend'),
  DBManager = require('./database/dbmanager');

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
      debug(`EventType: ${eventType} For: ${filename}`);
      if (filename && path.extname(filename) === ".json") {
        const jsonDir = path.join(this.rawDataDir, filename);

        // Filter unnecessary events
        if (this.set.has(jsonDir)) { return; }
        this.set.add(jsonDir);
        debug(`Current event set: ${this.set}`);

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

      Promise.all(loops.map((loop) => {
        let           dir = path.dirname(jsonDir),
            coverFilename = path.join(dir, loop.cover_filename),
            videoFilename = path.join(dir, loop.video_filename);
        // Move images
        let p1 = new Promise((resolve, reject) => {
          fs.rename(coverFilename, path.join(this.dataDir, path.basename(coverFilename)), (err) => {
            if (err) {reject(err);}
            resolve();
          });
        });
        // Move videos
        let p2 = new Promise((resolve, reject) => {
          fs.rename(videoFilename, path.join(this.dataDir, path.basename(videoFilename)), (err) => {
            if (err) {reject(err);}
            resolve();
          });
        });
        return [p1, p2];
      })).then(() => {
        debug('All images and videos are moved, writing to database...');
        // Insert into DB
        // this.insertDB({jsonDir: jsonDir, json: info});
        let manager = new DBManager();
        manager.insertLoops({jsonDir: jsonDir, json: info});

        return new Promise((resolve, reject) => {
          fs.rename(jsonDir, path.join(this.dataDir, path.basename(jsonDir)), (err) => {
            if (err) throw err;
            resolve();
          });
        });
      }).then(() => {
        // TODO remove empty folders
        debug(`${info.title} moved`);
      });

      // Remove event from set
      this.set.delete(jsonDir);
    });
  }
}

module.exports = Processor;
