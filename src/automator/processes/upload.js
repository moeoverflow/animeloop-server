const path = require('path');
const async = require('async');
const log4js = require('log4js');

const config = require('../../../config.js');
const parsing = require('../parse.js');
const findAnime = require('../workers/find-anime.js');
const addData = require('../workers/add-data.js');
const Manager = require('../../core/manager.js');
const Anilist = require('../../utils/anilist.js');

const anilist = new Anilist(config.automator.anilist);
const logger = log4js.getLogger('automator-queue-upload');

function process(job, done) {
  const filename = job.data.filename;
  logger.info(`Start to upload ${path.basename(filename)}`);

  const loops = parsing(filename);
  if (loops === undefined) {
    done(new Error(`uploading loops failed - file: ${filename}`));
    return;
  }

  async.waterfall([
    (callback) => {
      findAnime(job, loops, callback);
    },
    (loops, callback) => {
      addData(job, loops, callback);
    },
    (loops, callback) => {
      // eslint-disable-next-line no-underscore-dangle
      const seriesId = loops[0].entity.series._id;
      const anilistId = loops[0].entity.series.anilist_id;

      anilist.getInfo(anilistId, (err, data) => {
        if (err) {
          callback(err);
          return;
        }
        Manager.updateSeries(seriesId, data, callback);
      });
    },
  ], (err) => {
    done(err);
  });
}

module.exports = process;
