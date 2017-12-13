/* eslint-disable no-useless-escape */
const path = require('path');
const log4js = require('log4js');
const Queue = require('bull');

const logger = log4js.getLogger('automator');
const config = require('../../config.js');

const animeloopCli = require('./processes/animeloop-cli.js');
const upload = require('./processes/upload.js');
const convert = require('./processes/convert.js');

class Automator {
  constructor() {
    this.queue = new Queue('animeloop', config.redis);
    this.queue.process('convert', 0, convert);
    this.queue.process('upload', 1, upload);
    this.queue.process('animeloop-cli', 0, animeloopCli);

    this.queue.on('completed', (job) => {
      if (job.name === 'upload') {
        this.addConvertjob();
      }
    });
  }

  addAnimeloopCliJob(filename, callback) {
    this.queue.add('animeloop-cli', {
      filename,
    }, {
      priority: 333,
      jobId: `--ANIMELOOP-CLI--${path.basename(filename)}`.replace(/[^\w\s]/gi, '-'),
      delay: config.automator.animeloopCliDelay * 1000,
    }).then(callback);
  }

  addUploadJob(filename, callback) {
    this.queue.add('upload', {
      filename,
    }, {
      priority: 222,
      jobId: `--UPLOAD--${path.basename(filename)}`.replace(/[^\w\s]/gi, '-'),
      delay: config.automator.uploadDelay * 1000,
      attempts: 2,
      timeout: config.automator.uploadTTL * 1000,
    }).then(callback);
  }

  addConvertjob() {
    this.queue.add('convert', {}, {
      priority: 111,
      jobId: '--CONVERT--',
      removeOnComplete: true,
    });
  }

  getJob(id, callback) {
    this.queue.getJobFromId(id).then(callback);
  }
}

module.exports = Automator;
