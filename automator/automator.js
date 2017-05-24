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

    this.queue.process('convert', (job, done) => {
      convert(done);
    });

    this.queue.process('upload', (job, done) => {
      this.upload(job.data.filename, done);
    });

    this.queue.process('animeloop-cli', (job, done) => {
      this.animeloopCli(job.data.filename, done);
    });

    kue.app.set('title', 'Automator | Animeloop');
    this.app = express();
    this.app.use(basicAuth(config.automator.app.auth.username, config.automator.app.auth.password));
    this.app.use(kue.app);
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

    let loop = loops[0];

    async.series([
      (callback) => {
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
          callback(null);
        });
      },
      (callback) => {
        async.series(loops.map((loop) => {
          return (callback) => {
            this.alManager.addLoop(loop, callback);
          };
        }), (err) => {
          if (err != null && err != undefined) {
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


  }

  animeloopCli(filename, done) {
    let args = [config.animeloopCli.bin, '-i', filename, '--cover', '-o', config.storage.dir.autogen];
    let shellString = shellescape(args);
    logger.debug(`run command: ${shellString}`);
    shell.exec(shellString, (err, stdout, stderr) => {
      let basename = path.basename(filename, path.extname(filename));
      let dir = path.join(config.storage.dir.autogen, 'loops', basename);

      logger.debug(`move dir ${dir} to upload dir`);
      shell.mv(dir, config.storage.dir.upload);
      logger.debug(`delete file ${path.basename(filename)}.`);
      shell.rm(filename);

      done();
    });
  }
}

let automator = new Automator();

