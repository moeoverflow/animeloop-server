/* eslint-disable no-underscore-dangle */
const path = require('path');
const Twit = require('twit');
const log4js = require('log4js');

const logger = log4js.getLogger('autobot');

const Manager = require('../core/manager/manager.js');
const config = require('../../config');

const T = new Twit(config.bot.twitter);

module.exports = {
  tweet: () => {
    Manager.getRandomLoops(1, (err, loops) => {
      if (err) {
        logger.warning(`tweetbot -${err}`);
        return;
      }
      logger.info('tweetbot - got random loop.');

      const loop = loops[0];
      const filename = path.join(config.storage.dir.data, 'gif_360p', `${loop._id}.gif`);

      T.postMediaChunked({ file_path: filename }, (err, media) => {
        if (err) {
          logger.warning(`tweetbot - ${err}`);
          return;
        }

        logger.info('tweetbot - uploaded media.');

        if (loop.episode.no === undefined) {
          loop.episode.no = '';
        }

        const statusMessage = `${loop.series.title_japanese} ${loop.episode.no}\n` +
          `${loop.series.title} ${loop.episode.no}\n` +
          `${loop.series.title_english} ${loop.episode.no}\n` +
          `${loop.period.begin.slice(0, 11)}\n` +
          '#Animeloop\n' +
          `${config.app.url}/loop/${loop._id}`;

        T.post('statuses/update', { status: statusMessage, media_ids: [media.media_id_string] }, (err) => {
          if (err) {
            console.error(err);
            return;
          }
          logger.info(`tweetbot - tweeted - ${statusMessage}`);
        });
      });
    });
  },
};
