const path = require('path');
const async = require('async');
const shell = require('shelljs');
const log4js = require('log4js');

const logger = log4js.getLogger('automator-worker-add-data');
const Manager = require('../../core/manager.js');


function worker(job, data, callback) {
  const filename = job.data.filename;

  Manager.addLoopsAndFiles(data, (err) => {
    if (err) {
      logger.debug('database error');
      callback(err);
      return;
    }
    shell.rm('-r', path.dirname(filename));
    logger.info('Upload loops successfully.');
    callback(null, data);
  });
}

module.exports = worker;
