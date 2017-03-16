const fs  = require('fs'),
    path  = require('path')
    mysql = require('mysql')
    debug = require('debug')('backend');

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
      debug("EventType: " + eventType + " For: " + filename);
      if (filename && path.extname(filename) === ".json") {
        const jsonDir = path.join(this.rawDataDir, filename);

        // Filter unnecessary events
        if (this.set.has(jsonDir)) { return; }
        this.set.add(jsonDir);
        debug("Current event set: " + this.set);

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
          return debug('%s not exist, stop processing', jsonDir);
        } else {
          throw err;
        }
      }

      let info = JSON.parse(data),
         title = info.title,
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
        this.insertDB({jsonDir: jsonDir, json: info});
        return new Promise((resolve, reject) => {
          fs.rename(jsonDir, path.join(this.dataDir, path.basename(jsonDir)), (err) => {
            if (err) {reject(err);}
            resolve();
          });
        });
      }).then(() => {
        // TODO remove empty folders
        console.log(info.title + ' moved')
      });

      // Remove event from set
      this.set.delete(jsonDir);
    });
  }
  /**
   * @param {Info} data 
   * data.json: the json content
   * data.jsonDir: the directory of json
   */
  insertDB(data) {
    let title = data.json.title,
        loops = data.json.loops;
    // Get DB Connection
    var conn = mysql.createConnection(this.database);
    conn.connect();
    let sql = 'INSERT INTO Episode(name) VALUES(?)';
    conn.query(sql, [title], (err, results, fields) => {
      if (err) {console.error(err);}
      console.log("Episode inserted, insertId: " + results.insertId);
      // Insert loops
      loops.forEach((loop, i, arr) => {
        let         dir = path.dirname(data.jsonDir),
          coverFilename = path.join(dir, loop.cover_filename),
          videoFilename = path.join(dir, loop.video_filename);
        conn.query('INSERT INTO `Loop`(cover_filename, video_filename, episode_id) VALUES(?, ?, ?)'
          ,[data.coverFilename, data.videoFilename, results.insertId]
          ,(err, results, fields) => {
            if (err) console.error(err);
            conn.end();
          }
        );
      });
    });
  }
}

module.exports = Processor;
