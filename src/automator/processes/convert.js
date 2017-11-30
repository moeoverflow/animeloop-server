const log4js = require('log4js');

const logger = log4js.getLogger('automator-queue-convert');
const convert = require('../workers/converter.js');

function process(job, done) {
  logger.info('Start to do convert');
  convert([], () => {
    logger.info('Do convert successfully');
    done();
  });
}

module.exports = process;
