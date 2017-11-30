const async = require('async');
const log4js = require('log4js');

const logger = log4js.getLogger('automator-worker-find-anime');
const config = require('../../../config.js');
const Whatanime = require('../../utils/whatanime.js');

const whatanime = new Whatanime(config.automator.whatanime);


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

function worker(job, data, callback) {
  let loops = data;
  const flag = loops.length < 10;
  const randomLoops = loops.filter((loop) => {
    if (flag) {
      return flag;
    }

    // filter OP (first 3 minutes).
    const period = loop.entity.loop.period;
    const begin = hmsToSeconds(period.begin);

    return (begin > (3 * 60));
  }).slice(0).sort(() => 0.5 - Math.random()).slice(0, 5);

  logger.info('whatanime.ga - fetching info');
  async.series(randomLoops.map(loop => (callback) => {
    setTimeout(() => {
      whatanime.find(loop.files.jpg_1080p, callback);
    }, 5 * 1000);
  }), (err, results) => {
    if (err) {
      logger.debug('fetching info error.');
      callback(err);
      return;
    }
    job.progress(30, 100);

    results = results.filter(result => (result !== undefined));
    if (results.length === 0) {
      logger.debug('whatanime.ga fetch info empty.');
      callback(new Error('whatanime.ga fetch info empty.'));
      return;
    }

    const counts = {};
    results.forEach((result) => {
      const id = result.anilist_id;
      // this line will convert {number} type id to {string} type key
      counts[id] = counts[id] ? counts[id] + 1 : 1;
    });

    const len = randomLoops.length;
    const mid = Math.round(len / 2) + (len % 2 === 0 ? 1 : 0);
    let result;
    // eslint-disable-next-line no-restricted-syntax
    for (const key in counts) {
      if (counts[key] >= mid) {
        // eslint-disable-next-line prefer-destructuring
        result = results.filter(result => (result.anilist_id.toString() === key))[0];
        break;
      }
    }

    if (result === undefined) {
      logger.info('whatanime.ga has no matched info.');
      loops = loops.map((loop) => {
        loop.entity.series.title = 'DEFAULT SERIES';
        return loop;
      });
      callback(null, loops);
      return;
    }

    logger.info(`whatanime.ga - change series from ${loops[0].entity.series.title} to ${result.series}`);
    logger.info(`whatanime.ga - change episode from ${loops[0].entity.episode.title} to ${result.episode}`);
    loops = loops.map((loop) => {
      loop.entity.series.title = result.series;
      loop.entity.series.anilist_id = result.anilist_id;
      loop.entity.episode.title = result.episode;
      loop.entity.episode.no = result.no;
      return loop;
    });

    callback(null, loops);
  });
}

module.exports = worker;
