const mysql = require('mysql');
const path = require('path');
const debug = require('debug')('backend');

class DBManager {
  constructor({host, user, password, database}) {
    this.host     = host;
    this.user     = user;
    this.password = password;
    this.database = database;
  }

  createConnection() {
    return  mysql.createConnection({
      host     : this.host,
      user     : this.user,
      password : this.password,
      database : this.database
    });
  }

  getLoopsCount() {
    const conn = this.createConnection();
    conn.connect();
    let sql = 'SELECT COUNT(*) FROM `Loop`';
    return new Promise((resolve, reject) => {
      conn.query(sql, (err, results, fields) => {
        if (err) throw err;
        resolve(results.length);
        conn.end();
      });
    })
  }

  getLoopRandomly() {
    const conn = this.createConnection();
    conn.connect();
    let sql = 'SELECT '
    + 'Loop.duration, frame_start, frame_end, time_start, time_end, '
    + 'Loop.id AS id, Episode.name AS episode_name, Series.name AS series_name '
    + 'FROM `Loop` '
    + 'INNER JOIN Episode ON Loop.episode_id = Episode.id '
    + 'INNER JOIN Series ON Episode.series_id = Series.id '
    + 'INNER JOIN Media ON Loop.cover_id = Media.id OR Loop.video_id = Media.id '
    + 'ORDER BY RAND() LIMIT 1'
    return new Promise((resolve, reject) => {
      conn.query(sql, (err, results, fields) => {
        if (err) throw err;
        resolve(results[0]);
        conn.end();
      });
    })
  }
  
  /**
   * Get Loop with specified id
   * Return type: Promise
   * @param {Number} id 
   */
  getLoopById(id) {
    console.log(`ID: ${id}`)
    const conn = this.createConnection();
    conn.connect();
    let sql = 'SELECT '
    + 'duration, frame_start, frame_end, time_start, time_end, '
    + 'L.id AS id, Episode.name AS episode_name, Series.name AS series_name '
    + 'FROM (SELECT * FROM `Loop` WHERE id = ?) AS `L`'
    + 'INNER JOIN Episode ON L.episode_id = Episode.id '
    + 'INNER JOIN Series ON Episode.series_id = Series.id '
    + 'INNER JOIN Media ON L.cover_id = Media.id OR L.video_id = Media.id '
    + 'ORDER BY RAND() LIMIT 1'
    return new Promise((resolve, reject) => {
      conn.query(sql, [id], (err, results, fields) => {
        if (err) return reject(err);
        if (results.length > 0) {
          console.log(`getLoopById: ${results[0]}`);
          resolve(results[0]);
        } else {
          reject(`no loop for id = ${id}`)
        }
        conn.end();
      })
    })
  }
  /**
   * @param data
   * data.json   : the json content
   * data.jsonDir: the directory of json
   */
  insertLoops(data) {
    let title = data.json.title;
    let loops = data.json.loops;
    let seriesName = data.json.series;
    const conn = this.createConnection();
    conn.connect();
    addSeries()
    .then(addEpisode)
    .then(addLoops)
    .then(() => {
      conn.end();
    })

    function addSeries() {
      return new Promise((resolve, reject) => {
        // Insert addSeries
        let sql = 'INSERT INTO Series(name) VALUES(?)';
        conn.query(sql, [seriesName], (err, results, fields) => {
          if (err) throw err;
          resolve(results.insertId)
        })
      })
    }

    function addEpisode(seriesId) {
      return new Promise((resolve, reject) => {
        // Insert Episode
        let sql = 'INSERT INTO Episode(name, series_id) VALUES(?, ?)';
        conn.query(sql, [title, seriesId], (err, results, fields) => {
          if (err) throw err;
          // Get the auto increment id
          debug(`Insert results: ${results}`);
          debug(`Episode inserted, insertId: ${results.insertId}`);
          resolve(results.insertId);
        });
      });
    }

    function addMedia({name, type}) {
      return new Promise((resolve, reject) => {
        let sql = 'INSERT INTO `Media`(name, type) VALUES(?, ?)';
        conn.query(sql, [name, type], (err, results, fields) => {
          if (err) { reject(err);}
          resolve(results.insertId);
        })
      })
    }
    
    function addLoops(episodeId) {
      return new Promise((resolve, reject) => {
        // Insert loops
        loops.forEach((loop) => {
          let coverFilename = loop.cover_filename,
              videoFilename = loop.video_filename;

          let videoId = addMedia({name: videoFilename, type: 'video'});
          let coverId = addMedia({name: coverFilename, type: 'image'});

          Promise
          .all([coverId, videoId])
          .then(([coverId, videoId]) => {
            let sql = 'INSERT INTO '
            + '`Loop`(episode_id, cover_id, video_id, duration, frame_start, frame_end, time_start, time_end) '
            + 'VALUES(?, ?, ?, ?, ?, ?, ?, ?)';
            let values = [episodeId, coverId, videoId, loop.duration, loop.frame.start, loop.frame.end, loop.time.start, loop.time.end];
            conn.query(sql, values, (err, results, fields) => {
              if (err) { reject(err);}
              resolve();
            });
          }, (err) => {console.error(err)});
        });
      });
    }
  }
}

module.exports = DBManager;