const path = require('path');
const Queue = require('bull');
const log4js = require('log4js');
const shell = require('shelljs');
const shellescape = require('shell-escape');

const logger = log4js.getLogger('automator-queue-animeloop');
const config = require('../../../config.js');

function process(job, done) {
  const filename = job.data.filename;
  logger.info(`Start to run animeloop-cli with ${path.basename(filename)}`);

  const args = [config.animeloopCli.bin, '-i', filename, '--cover', '-o', config.storage.dir.autogen];
  const shellString = shellescape(args);

  logger.debug(`Run command: ${shellString}`);
  const cli = shell.exec(shellString, { async: true, silent: true });
  cli.on('exit', (code) => {
    if (code !== 0) {
      return;
    }

    logger.debug(`code: ${code}`);
    const basename = path.basename(filename, path.extname(filename));
    const dir = path.join(config.storage.dir.autogen, 'loops', basename);

    logger.debug(`move dir ${dir} to upload dir`);
    shell.mv(dir, config.storage.dir.upload);
    logger.debug(`delete file ${path.basename(filename)}`);
    shell.rm(filename);

    logger.info(`Run animeloop-cli with ${path.basename(filename)} successfully`);
    done();
  });
}

module.exports = process;
