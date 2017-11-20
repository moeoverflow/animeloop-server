/* eslint-disable no-underscore-dangle */
const async = require('async');
const log4js = require('log4js');
const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

const logger = log4js.getLogger('manager');
const Database = require('./database.js');
const File = require('./file.js');

class Manager {
  /*
   -------------- Loop --------------
   */

  static addLoopsAndFiles(loops, files, callback) {
    async.series([
      (callback) => {
        Database.insertLoops(loops, (err, docs) => {
          if (err) {
            logger.log(err, logger.ERROR);
            Database.deleteLoopsByIds(loops.map(loop => loop._id), callback);
          }

          if (docs) {
            callback(null);
          } else {
            callback(new Error('Add loops to database failed.'));
          }
        });
      },
      (callback) => {
        File.saveFileById(loops, files, callback);
      },
    ], callback);
  }

  static removeLoopsAndFiles(loops, callback) {
    const ids = loops.map(loop => loop._id);
    async.series([
      (callback) => {
        Database.deleteLoopById(ids, callback);
      },
      (callback) => {
        File.deleteFilesByIds(ids, callback);
      },
    ], callback);
  }


  static getFullLoop(id, callback) {
    Database.findFullLoop(id, handleLoop(callback));
  }

  static getLoop(id, callback) {
    Database.findLoop(id, handleLoop(callback));
  }

  static getFullLoopsByEpisode(id, callback) {
    Database.findFullLoopsByEpisode(id, handleLoops(callback));
  }

  static getLoopsByEpisode(id, callback) {
    Database.findLoopsByEpisode(id, handleLoops(callback));
  }

  static getFullLoopsBySeries(id, callback) {
    Database.findFullLoopsBySeries(id, handleLoops(callback));
  }

  static getLoopsBySeries(id, callback) {
    Database.findLoopsBySeries(id, handleLoops(callback));
  }

  static getLoopsByTag(tagName, callback) {
    async.waterfall([
      (callback) => {
        Database.findTags(tagName, callback);
      },
      (tags, callback) => {
        async.series(tags.map(tag => (callback) => {
          Database.findLoop(tag.loopid, callback);
        }), callback);
      },
    ], handleLoops(callback));
  }

  static getRandomFullLoops(n, callback) {
    Database.findRandomFullLoops(n, handleLoops(callback));
  }

  static getRandomLoops(n, callback) {
    Database.findRandomLoops(n, handleLoops(callback));
  }

  static getLoopsByGroup(no, callback) {
    Database.findLoopsByGroup(no, handleLoops(callback));
  }

  static getLoopsGroupCount(callback) {
    const perPage = 100;

    Database.findLoopsCount((err, count) => {
      const totalPage = Math.ceil(count / perPage);
      callback(err, totalPage);
    });
  }

  static getLoopsCount(callback) {
    Database.findLoopsCount(callback);
  }

  /*
   -------------- Episode --------------
   */

  static getFullEpisode(id, callback) {
    Database.findFullEpisode(id, handleEpisode(callback));
  }

  static getEpisode(id, callback) {
    Database.findEpisode(id, handleEpisode(callback));
  }

  static getEpisodesBySeries(id, callback) {
    Database.findEpisodesBySeries(id, handleEpisodes(callback));
  }

  static getFullEpisodesBySeries(id, callback) {
    Database.findFullEpisodesBySeries(id, handleEpisodes(callback));
  }

  static getAllEpisodes(callback) {
    Database.findAllEpisodes(handleEpisodes(callback));
  }

  static getAllFullEpisodes(callback) {
    Database.findAllFullEpisodes(handleEpisodes(callback));
  }

  static getFullEpisodesByGroup(no, callback) {
    Database.findFullEpisodesByGroup(no, handleEpisodes(callback));
  }

  static getEpisodesByGroup(no, callback) {
    Database.findEpisodesByGroup(no, handleEpisodes(callback));
  }

  static getEpisodesGroupCount(callback) {
    const perPage = 30;

    Database.findEpisodesCount((err, count) => {
      const totalPage = Math.ceil(count / perPage);
      callback(err, totalPage);
    });
  }

  static getEpisodesCount(callback) {
    Database.findEpisodesCount(callback);
  }

  /*
   -------------- Series --------------
   */

  static getSeries(id, callback) {
    Database.findSeries(id, handleSeries(callback));
  }

  static getSeriesesCount(callback) {
    Database.findSeriesesCount(callback);
  }

  static getSeriesesbyGroup(no, callback) {
    Database.findSeriesesByGroup(no, handleSerieses(callback));
  }

  static getSeriesesGroupCount(callback) {
    const perPage = 30;

    Database.findSeriesesCount((err, count) => {
      const totalPage = Math.ceil(count / perPage);
      callback(err, totalPage);
    });
  }

  /*
   -------------- Tags --------------
   */

  static getTagsByLoop(id, callback) {
    Database.findTagsByLoop(id, handleTags(callback));
  }
}

function loop(doc) {
  const data = {
    id: doc._id,
    duration: doc.duration,
    period: {
      begin: doc.period.begin,
      end: doc.period.end,
    },
    frame: {
      begin: doc.frame.begin,
      end: doc.frame.end,
    },
    sourceFrom: doc.sourceFrom,
    uploadDate: doc.uploadDate,
    files: File.getPublicFilesUrl(doc._id),
  };

  if (doc.episode instanceof ObjectId) {
    data.episodeid = doc.episode;
  } else {
    data.episode = episode(doc.episode);
  }

  if (doc.series instanceof ObjectId) {
    data.seriesid = doc.series;
  } else {
    data.series = series(doc.series);
  }

  return data;
}

function handleLoops(callback) {
  return (err, docs) => {
    if (err) {
      callback(err);
      return;
    }

    docs = docs.map(loop);
    callback(err, docs);
  };
}

function handleLoop(callback) {
  return (err, doc) => {
    if (err) {
      callback(err);
      return;
    }

    doc = loop(doc);
    callback(err, doc);
  };
}

function episode(doc) {
  const data = {
    id: doc._id,
    no: doc.no,
  };

  if (doc.series instanceof ObjectId) {
    data.seriesid = doc.series;
  } else {
    data.series = series(doc.series);
  }

  return data;
}

function handleEpisodes(callback) {
  return (err, docs) => {
    if (err) {
      callback(err);
      return;
    }

    docs = docs.map(episode);
    callback(err, docs);
  };
}

function handleEpisode(callback) {
  return (err, doc) => {
    if (err) {
      callback(err);
      return;
    }

    doc = episode(doc);
    callback(err, doc);
  };
}

function series(doc) {
  const data = {
    id: doc._id,
    title: doc.title,
    title_romaji: doc.title_romaji,
    title_english: doc.title_english,
    title_japanese: doc.title_japanese,
    description: doc.description,
    genres: doc.genres,
    total_episodes: doc.total_episodes,
    anilist_id: doc.anilist_id,
  };

  const seasonYear = Math.floor(doc.start_date_fuzzy / 10000);
  const seasonMonth = Math.floor(doc.start_date_fuzzy / 100) % 100;
  data.season = `${seasonYear}-${seasonMonth}`;

  if (doc.image_url_large) {
    data.image_url_large = File.getAnilistImageLarge(doc.anilist_id);
  }
  if (doc.image_url_banner) {
    doc.image_url_banner = File.getAnilistImageBanner(doc.anilist_id);
  }

  return data;
}

function handleSeries(callback) {
  return (err, doc) => {
    if (err) {
      callback(err);
      return;
    }

    doc = series(doc);
    callback(err, doc);
  };
}

function handleSerieses(callback) {
  return (err, docs) => {
    if (err) {
      callback(err);
      return;
    }

    docs = docs.map(series);
    callback(err, docs);
  };
}

function tag(doc) {
  const data = Object.assign({}, doc._doc);
  data.id = doc._id;
  delete data._id;
  return data;
}

function handleTags(callback) {
  return (err, docs) => {
    if (err) {
      callback(err);
      return;
    }
    docs = docs.map(tag);
    callback(err, docs);
  };
}

module.exports = Manager;
