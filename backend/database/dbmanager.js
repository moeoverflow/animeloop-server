const mysql = require('mysql'),
     config = require('../config'),
       path = require('path'),
      debug = require('debug')('backend');

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

  getTheNumberOfLoops() {
    const conn = this.createConnection();
    conn.connect();
    let sql = 'SELECT COUNT(*) FROM `Loop`';
    return new Promise((resolve, reject) => {
      conn.query(sql, (err, results, fields) => {
        if (err) reject(err);
        resolve(results[0]);
        conn.end();
      });
    })
  }

  getLoopById(id) {
    const conn = this.createConnection();
    conn.connect();
    let sql = "SELECT * FROM `Loop` WHERE id = ?";
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
    let title = data.json.title,
        loops = data.json.loops;
    const conn = this.createConnection();
    conn.connect();
    new Promise((resolve, reject) => {
      // Insert Episode
      let sql = 'INSERT INTO Episode(name) VALUES(?)';
      conn.query(sql, [title], (err, results, fields) => {
        if (err) throw err;
        // Get the auto increment id
        debug(`Insert results: ${results}`);
        debug(`Episode inserted, insertId: ${results.insertId}`);
        resolve(results.insertId);
      });
    }).then((insertId) => {
      return new Promise((resolve, reject) => {
        // Insert loops
        loops.forEach((loop) => {
          let         dir = path.dirname(data.jsonDir),
            coverFilename = path.join(dir, loop.cover_filename),
            videoFilename = path.join(dir, loop.video_filename);
          let sql = 'INSERT INTO `Loop`(cover_filename, video_filename, episode_id) VALUES(?, ?, ?)';
          conn.query(sql, [coverFilename, videoFilename, insertId], (err, results, fields) => {
            if (err) {reject(err);}
            resolve();
          });
        });
      });
    }).then(() => {
      conn.end();
    })
  }
}

module.exports = DBManager;