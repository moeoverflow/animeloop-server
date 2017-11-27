/* eslint-disable no-useless-escape */
const path = require('path');
const async = require('async');
const express = require('express');
const basicAuth = require('basic-auth-connect');
const shell = require('shelljs');
const chokidar = require('chokidar');
const shellescape = require('shell-escape');
const log4js = require('log4js');
const kue = require('kue');

const logger = log4js.getLogger('automator');

const config = require('../../config.js');
const Manager = require('../core/manager.js');
const parsing = require('./parse.js');
const convert = require('./converter.js');
const whatanime = require('../utils/whatanime.js');
const Anilist = require('../utils/anilist.js');


class Automator {
  constructor() {
    this.anilist = new Anilist(config.automator.anilist);

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
        db: 3,
      },
    });

    this.queue.process('convert', 1, (job, done) => {
      logger.info('Start to do convert');
      convert([], () => {
        logger.info('Do convert successfully');
        done();
      });
    });

    this.queue.process('upload', 1, (job, done) => {
      const { filename } = job.data.filename;
      logger.info(`Start to upload ${path.basename(filename)}`);
      this.upload(job, filename, () => {
        logger.info(`Upload ${path.basename(filename)} successfully`);
        done();
      });
    });

    this.queue.process('animeloop-cli', 1, (job, done) => {
      const { filename } = job.data.filename;
      logger.info(`Start to run animeloop-cli with ${path.basename(filename)}`);
      this.animeloopCli(job, filename, () => {
        logger.info(`Run animeloop-cli with ${path.basename(filename)} successfully`);
        done();
      });
    });

    this.queue.process('anilist', 1, (job, done) => {
      const { series_id } = job.data.series_id;
      const { anilist_id } = job.data.anilist_id;

      this.anilist.getInfo(anilist_id, (err, data) => {
        if (err) {
          done(err);
          return;
        }

        Manager.updateSeries(series_id, data, done);
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
      usePolling: true,
    });
    logger.info('Start to watch upload and raw dir...');
    // eslint-disable-next-line no-useless-escape
    this.watcher.on('add', (filename) => {
      const uploadRegex = new RegExp(`.*${config.storage.dir.upload}.*\.(json)$`);
      const rawRegex = new RegExp(`.*${config.storage.dir.raw}.*\.(mp4|mkv)$`);

      const { queue } = this.queue;
      if (uploadRegex.test(filename)) {
        const job = queue.create('upload', {
          title: `Upload file: ${path.basename(filename)}`,
          filename,
        })
          .ttl(config.automator.uploadTTL * 1000)
          .attempts(2)
          .priority('medium')
          .delay(config.automator.uploadDelay * 1000)
          .save((err) => {
            if (!err) {
              logger.info(`Job ID: ${job.id} - Upload dir new file: ${path.basename(filename)}`);
            }
          });
        job.on('complete', () => {
          const job = queue.create('convert', {
            title: 'Do convert.',
          })
            .priority('high')
            .removeOnComplete(true)
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
        const job = queue.create('animeloop-cli', {
          title: `run animeloop-cli with file: ${path.basename(filename)}`,
          filename,
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

  upload(job, jsonfile, done) {
    let loops = parsing(jsonfile);
    if (loops === undefined) {
      done(new Error(`uploading loops failed - file: ${jsonfile}`));
      return;
    }

    async.waterfall([
      (callback) => {
        const flag = loops.length < 10;
        const randomLoops = loops.filter((loop) => {
          if (flag) {
            return flag;
          }

          function hmsToSeconds(str) {
            const p = str.split(':');
            let s = 0;
            let m = 1;
            while (p.length > 0) {
              s += m * parseInt(p.pop(), 10);
              m *= 60;
            }
            return s;
          }

          // filter OP (first 3 minutes).
          const { period } = loop.entity.loop.period;
          const begin = hmsToSeconds(period.begin);

          return (begin > (3 * 60));
        }).slice(0).sort(() => 0.5 - Math.random()).slice(0, 5);

        job.log('whatanime.ga - fetching info');
        logger.info('whatanime.ga - fetching info');
        async.series(randomLoops.map(loop => (callback) => {
          setTimeout(() => {
            whatanime(loop.files.jpg_1080p, callback);
          }, 5 * 1000);
        }), (err, results) => {
          if (err) {
            job.log('fetching info error.');
            logger.warning('fetching info error.');
            callback(err);
            return;
          }
          job.progress(30, 100);

          results = results.filter(result => (result !== undefined));
          if (results.length === 0) {
            logger.warning('whatanime.ga fetch info empty.');
            callback(new Error('whatanime.ga fetch info empty.'));
            return;
          }

          const counts = {};
          results.forEach((result) => {
            const id = result.anilist_id;
            counts[id] = counts[id] ? counts[id] + 1 : 1;
          });

          const len = randomLoops.length;
          const mid = Math.round(len / 2) + (len % 2 === 0 ? 1 : 0);
          let result;
          // eslint-disable-next-line no-restricted-syntax
          for (const key in counts) {
            if (counts[key] >= mid) {
              // eslint-disable-next-line prefer-destructuring
              result = results.filter(result => (result.anilist_id === key))[0];
              break;
            }
          }

          if (result === undefined) {
            job.log('whatanime.ga has no matched info.');
            logger.info('whatanime.ga has no matched info.');
            loops = loops.map((loop) => {
              loop.entity.series.title = 'DEFAULT SERIES';
              return loop;
            });
            callback();
            return;
          }

          job.log(`whatanime.ga - change series from ${loops[0].entity.series.title} to ${result.series}`);
          job.log(`whatanime.ga - change episode from ${loops[0].entity.episode.title} to ${result.episode}`);
          logger.info(`whatanime.ga - change series from ${loops[0].entity.series.title} to ${result.series}`);
          logger.info(`whatanime.ga - change episode from ${loops[0].entity.episode.title} to ${result.episode}`);
          loops = loops.map((loop) => {
            loop.entity.series.title = result.series;
            loop.entity.series.anilist_id = result.anilist_id;
            loop.entity.episode.title = result.episode;
            loop.entity.episode.no = result.no;
            return loop;
          });

          callback();
        });
      },
      (callback) => {
        job.log(`Start to add loops into database: ${jsonfile}`);
        logger.debug(`Start to add loops into database: ${jsonfile}`);
        async.series(loops.map(loop => (callback) => {
          Manager.addLoop(loop, callback);
        }), (err, data) => {
          if (err != null || err !== undefined) {
            logger.error('database error');
            callback(err);
            return;
          }
          shell.rm('-r', path.dirname(jsonfile));
          logger.info('Upload loops successfully.');
          callback(null, data);
        });
      },
      (data, callback) => {
        // eslint-disable-next-line no-underscore-dangle
        const { series_id } = data[0].series._id;
        const { anilist_id } = data[0].series.anilist_id;

        this.anilist.getInfo(anilist_id, (err, data) => {
          if (err) {
            callback(err);
            return;
          }

          Manager.updateSeries(series_id, data, callback);
        });
      },
    ], (err, entity) => {
      done(err, entity);
    });
  }

  animeloopCli(job, filename, done) {
    const args = [config.animeloopCli.bin, '-i', filename, '--cover', '-o', config.storage.dir.autogen];
    const shellString = shellescape(args);
    logger.debug(`run command: ${shellString}`);

    const cli = shell.exec(shellString, { async: true, silent: true });
    cli.stdout.on('data', (data) => {
      const match = data.match(/Resizing video\.\.\. (\d?\d?\d)%/);
      if (match) {
        const frames = parseInt(match[1], 10);
        job.progress(frames * 9, 1000);
      }
      job.log(data);
    });

    cli.on('exit', (code) => {
      job.progress(1000, 1000);
      logger.debug(`code: ${code}`);
      const basename = path.basename(filename, path.extname(filename));
      const dir = path.join(config.storage.dir.autogen, 'loops', basename);

      logger.debug(`move dir ${dir} to upload dir`);
      shell.mv(dir, config.storage.dir.upload);
      logger.debug(`delete file ${path.basename(filename)}`);
      shell.rm(filename);
      done();
    });
  }
}

// eslint-disable-next-line no-unused-vars
const automator = new Automator();
