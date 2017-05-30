const path = require('path');
const fs = require('fs');
const async = require('async');
const express = require('express');
const basicAuth = require('basic-auth-connect');
const shell = require('shelljs');
const chokidar = require('chokidar');
const mkdirp = require('mkdirp');
const shellescape = require('shell-escape');
const log4js = require('log4js');
const logger = log4js.getLogger('automator');
const kue = require('kue');

const config = require('../config');
const ALManager = require('../manager/almanager');
const parsing = require('./parse');
const convert = require('./converter');
const whatanime = require('../utils/whatanime');



class Automator {
  constructor() {
    this.alManager = new ALManager();
    this.databaseHandler = this.alManager.databaseHandler;

    this.initQueue();
    this.watching();
  }

  initQueue() {
    this.queue = kue.createQueue({
      prefix: 'animeloop-automator',
      redis: {
        port: config.automator.redis.port,
        host: config.automator.redis.host,
        auth: config.automator.redis.auth,
        db: 3, // if provided select a non-default redis db
        options: {
          // see https://github.com/mranney/node_redis#rediscreateclient
        }
      }
    });

    this.queue.process('convert', 1, (job, done) => {
      logger.info('Start to do convert');
      convert([], () => {
        logger.info('Do convert successfully');
        done();
      });
    });

    this.queue.process('upload', 1, (job, done) => {
      let filename = job.data.filename;
      logger.info(`Start to upload ${path.basename(filename)}`);
      this.upload(filename, () => {
        logger.info(`Upload ${path.basename(filename)} successfully`);
        done();
      });
    });

    this.queue.process('animeloop-cli', 1, (job, done) => {
      let filename = job.data.filename;
      logger.info(`Start to run animeloop-cli with ${path.basename(filename)}`);
      this.animeloopCli(job.data.filename, () => {
        logger.info(`Run animeloop-cli with ${path.basename(filename)} successfully`);
        done();
      });
    });

    kue.app.set('title', 'Automator | Animeloop');
    this.app = express();
    this.app.use(basicAuth(config.automator.app.auth.username, config.automator.app.auth.password));
    this.app.use(config.automator.app.url, kue.app);
    this.app.listen(config.automator.app.port, config.automator.app.host);
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

      let queue = this.queue;
      if (uploadRegex.test(filename)) {
        let job = queue.create('upload', {
          title: `Upload file: ${path.basename(filename)}`,
          filename
        })
        .priority('medium')
        .delay(config.automator.uploadDelay * 1000)
        .save((err) => {
          if (!err) {
            logger.info(`Job ID: ${job.id} - Upload dir new file: ${path.basename(filename)}`);
          }
        });
        job.on('complete', () => {
          let job = queue.create('convert', {
            title: 'Do convert.',
          })
          .priority('high')
          .save((err) => {
            if (!err) {
              logger.info(`Job ID: ${job.id} - Do convert`);
            }
          });
        });
        job.on('error', (err) => {
          logger.debug(err);
        });

      } else if (rawRegex.test(filename)) {
        let job = queue.create('animeloop-cli', {
          title: `run animeloop-cli with file: ${path.basename(filename)}`,
          filename
        }).priority('low')
        .delay(config.automator.animeloopCliDelay * 1000)
        .save((err) => {
            if (!err) {
              logger.info(`Job ID: ${job.id} - Raw dir new file: ${path.basename(filename)}`);
            }
        });

        job.on('error', (err) => {
          logger.debug(err);
        });
      }
    });
  }

  upload(jsonfile, done) {
    let loops = parsing(jsonfile);
    if (loops == undefined) {
      done(new Error(`uploading loops failed - file: ${jsonfile}`));
      return;
    }

    async.series([
      (callback) => {
        function selectLoops(array) {
          if (array.length <= 3) {
            return array;
          }

          let split = Math.round(array.length / 5);
          var results = array.filter((item, index) => {
            return (index % split == 0);
          });

          results.shift();
          if (results.length % 2 == 0) {
            results.pop();
          }

          return results;
        }
        logger.info('whatanime.ga - fetching info');
        async.series(selectLoops(loops).map((loop) => {
          return (callback) => {
            whatanime(loop.files.jpg_1080p, (err, result) => {
              callback(null, result);
            });
          }
        }), (err, results) => {
          if (err) {
            callback(err);
          }

          let result = results.sort((prev, next) => {
            return (prev.similarity < next.similarity);
          })[0];

          logger.info(`whatanime.ga - change series from ${loops[0].entity.series.title} to ${result.series}`);
          logger.info(`whatanime.ga - change episode from ${loops[0].entity.episode.title} to ${result.episode}`);
          loops = loops.map((loop) => {
            loop.entity.series.title = result.series;
            loop.entity.series.anilist_id = result.anilist_id;
            loop.entity.episode.title = result.episode;
            return loop;
          });

          callback();
        });
      },
      (callback) => {
        logger.debug(`Start to add loops into database: ${jsonfile}`)
        async.series(loops.map((loop) => {
          return (callback) => {
            this.alManager.addLoop(loop, callback);
          };
        }), (err) => {
          if (err != null || err != undefined) {
            done(err);
            return;
          }
          shell.rm('-r', path.dirname(jsonfile));
          logger.info('Upload loops successfully.');
          callback(null);
        });
      }
    ], (err) => {
      if (err != null && err != undefined) {
        done(err);
        return;
      }
      done();
    })

    function getLoopInfo(loops) {
      let split = Math.floor(loops.length / 4);
      loops = loops.filter((loop, index) => {
        return (index % split);
      });

      async.series(loops.map((loop) => {
        return (callback) => {
          whatanime(loop.files.jpg_1080p, (err, result) => {
            if (!err) {
              if (result) {
                loops = loops.map((loop) => {
                  loop.entity.series.title = result.series;
                  loop.entity.series.anilist_id = result.anilist_id;
                  loop.entity.episode.title = result.episode;
                  return loop;
                });
              }
            }
            callback();
          });
        }
      }));
    }
  }

  animeloopCli(filename, done) {
    let args = [config.animeloopCli.bin, '-i', filename, '--cover', '-o', config.storage.dir.autogen];
    let shellString = shellescape(args);
    logger.debug(`run command: ${shellString}`);
    shell.exec(shellString, () => {
      let basename = path.basename(filename, path.extname(filename));
      let dir = path.join(config.storage.dir.autogen, 'loops', basename);

      logger.debug(`move dir ${dir} to upload dir`);
      shell.mv(dir, config.storage.dir.upload);
      logger.debug(`delete file ${path.basename(filename)}`);
      shell.rm(filename);

      done();
    });
  }
}

let automator = new Automator();
