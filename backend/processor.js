const fs = require('fs'),
    path = require('path');

class Processor {
  constructor(rawDataDir, dataDir, processDelay) {
    this.rawDataDir   = rawDataDir;
    this.dataDir      = dataDir;
    this.processDelay = processDelay || 3;
    this.set          = new Set();
  }

  start() {
    fs.watch(this.rawDataDir, {recursive: true},  (eventType, filename) => {
      console.log("EventType: " + eventType + " For: " + filename);
      if (filename && path.extname(filename) === ".json") {
        const jsonDir = path.join(this.rawDataDir, filename);

        // Filter unnecessary events
        if (this.set.has(jsonDir)) { return; }
        this.set.add(jsonDir);
        console.log(this.set);

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
          return console.log(jsonDir + ' not exist');
        } else {
          throw err;
        }
      }

      let info = JSON.parse(data),
         title = info.title,
        source = info.source,
         loops = info.loops;
      Promise.all(loops.map((loop) => {
        let           dir = path.dirname(jsonDir),
            coverFilename = path.join(dir, loop.cover_filename),
            videoFilename = path.join(dir, loop.video_filename);

        console.log(coverFilename);
        // TODO writing data to database

        // Move images and videos
        let p1 = new Promise((resolve, reject) => {
          fs.rename(coverFilename, path.join(this.dataDir, path.basename(coverFilename)), (err) => {
            if (err) {reject(err);}
            resolve();
          });
        });
        let p2 = new Promise((resolve, reject) => {
          fs.rename(videoFilename, path.join(this.dataDir, path.basename(videoFilename)), (err) => {
            if (err) {reject(err);}
            resolve();
          });
        });
        return [p1, p2];
      })).then(() => {
        console.log('all images and videos are moved')
        return new Promise((resolve, reject) => {
          fs.rename(jsonDir, path.join(this.dataDir, path.basename(jsonDir)), (err) => {
            if (err) {reject(err);}
            resolve();
          });
        });
      }).then(() => {
        // TODO remove empty folders
        console.log('json moved')
      });

      // Remove event from set
      this.set.delete(jsonDir);
    });
  }
}

module.exports = Processor;
