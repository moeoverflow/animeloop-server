/* eslint-disable no-underscore-dangle */
const async = require('async');
const path = require('path');
const Twit = require('twit');
const log4js = require('log4js');

const logger = log4js.getLogger('tweetbot');

const Manager = require('../core/manager.js');
const config = require('../../config');

const T = new Twit(config.bot.twitter);

module.exports = {
  tweet: () => {
    async.waterfall([
      (callback) => {
        logger.info('get random loop...');
        Manager.getRandomFullLoops(1, callback);
      },
      (loops, callback) => {
        const loop = loops[0];
        const filename = path.join(config.storage.dir.data, 'mp4_720p', `${loop.id}.mp4`);

        logger.info('upload media...');
        T.postMediaChunked({ file_path: filename }, (err, media) => {
          if (err) {
            callback(err);
            return;
          }
          callback(null, media, loop);
        });
      },
      (media, loop, callback) => {
        if (loop.episode.no === undefined) {
          loop.episode.no = '';
        }

        const statusMessage = `${loop.series.title_japanese} ${loop.episode.no}\n` +
          `${loop.series.title} ${loop.episode.no}\n` +
          `${loop.series.title_english} ${loop.episode.no}\n` +
          `${loop.period.begin.slice(0, 11)}~${loop.period.end.slice(0, 11)}\n` +
          '#Animeloop\n' +
          `${config.app.url}/loop/${loop.id}`;

        logger.info(`send tweet:\n ${statusMessage}`);
        T.post('statuses/update', {
          status: statusMessage,
          media_ids: [media.media_id_string],
        }, callback);
      },
    ], (err) => {
      if (err) {
        logger.error(err);
        return;
      }
      logger.info('tweeted');
    });
  },
};
