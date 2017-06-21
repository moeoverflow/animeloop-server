const path = require('path');
const Twit = require('twit');
const log4js = require('log4js');
const logger = log4js.getLogger('autobot');

const ALManager = require('../manager/almanager');
const config = require('../config');

const alManager = new ALManager();
var T = new Twit(config.bot.twitter);

module.exports = {
  tweet: () => {
    alManager.getRandomLoops(1, (err, loops) => {
      if (err) {
        logger.error('tweetbot -' + err);
        return;
      }
      logger.info('tweetbot - got random loop.');

      let loop = loops[0];
      let filename = path.join(config.storage.dir.data, 'gif_360p', `${loop._id}.gif`);

      T.postMediaChunked({ file_path: filename }, (err, media, response) => {
        if (err) {
          logger.error('tweetbot -' + err);
          return;
        }

        logger.info('tweetbot - uploaded media.');

        if (loop.episode.no == undefined) {
          loop.episode.no = '';
        }

        var status = `${loop.series.title_japanese} ${loop.episode.no} ${loop.period.begin.slice(0, 11)} #Animeloop ${config.app.url}/loop/${loop._id}`;

        T.post('statuses/update', { status: status, media_ids: [media.media_id_string] }, (err, status, response) => {
          if (err) {
            console.error(err);
            return;
          }
          logger.info('tweetbot - tweeted.');

          console.log(status);
        });
      });
    });
  }
};