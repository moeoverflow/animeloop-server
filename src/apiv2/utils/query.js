const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;
const Response = require('./response.js');


class Query {
  static loop(req, callback) {
    const cdn = req.query.cdn;
    const episodeId = req.query.episodeid;
    const seriesId = req.query.seriesid;
    const duration = req.query.duration;
    const sourceFrom = req.query.source_from;
    const full = req.query.full;
    const page = req.query.page;
    const limit = req.query.limit;

    const query = {};
    const opts = {};

    paramCDN(cdn, opts);

    if (!paramSeriesId(seriesId, query)) {
      callback(Response.returnError(400, 'query parameter [seriesid] was not correct, please provide a 24 length MongoDB ObjectId string.'));
      return;
    }
    if (!paramEpisodeId(episodeId, query)) {
      callback(Response.returnError(400, 'query parameter [episodeid] was not correct, please provide a 24 length MongoDB ObjectId string.'));
      return;
    }

    if (!paramLoopDuration(duration, query)) {
      callback(Response.returnError(400, 'please provide correct [duration] query param.'));
      return;
    }

    paramLoopSourceFrom(sourceFrom, query);

    paramFull(full, opts);
    if (!paramLimit(limit, opts)) {
      callback(Response.returnError(400, 'query parameter [limit] parse failed, please provide an integer number.'));
      return;
    }
    if (!paramPage(page, opts)) {
      callback(Response.returnError(400, 'query parameter [page] parse failed, please provide an integer number.'));
      return;
    }

    callback(null, {
      query,
      opts,
    });
  }

  static episode(req, callback) {
    const cdn = req.query.cdn;
    const seriesId = req.query.seriesid;
    const no = req.query.no;
    const full = req.query.full;
    const page = req.query.page;
    const limit = req.query.limit;

    const query = {};
    const opts = {};

    paramCDN(cdn, opts);

    if (!paramSeriesId(seriesId, query)) {
      callback(Response.returnError(400, 'query parameter [seriesid] was not correct, please provide a 24 length MongoDB ObjectId string.'));
      return;
    }
    paramNo(no, query);
    paramFull(full, opts);
    if (!paramLimit(limit, opts)) {
      callback(Response.returnError(400, 'query parameter [limit] parse failed, please provide an integer number.'));
      return;
    }
    if (!paramPage(page, opts)) {
      callback(Response.returnError(400, 'query parameter [page] parse failed, please provide an integer number.'));
      return;
    }

    callback(null, {
      query,
      opts,
    });
  }

  static series(req, callback) {
    const cdn = req.query.cdn;
    const type = req.query.type;
    const page = req.query.page;
    const limit = req.query.limit;

    const query = {};
    const opts = {};

    paramCDN(cdn, opts);

    paramSeriesType(type, query);
    if (!paramLimit(limit, opts)) {
      callback(Response.returnError(400, 'query parameter [limit] parse failed, please provide an integer number.'));
      return;
    }
    if (!paramPage(page, opts)) {
      callback(Response.returnError(400, 'query parameter [page] parse failed, please provide an integer number.'));
      return;
    }

    callback(null, {
      query,
      opts,
    });
  }

  static tag(req, callback) {
    const cdn = req.query.cdn;
    const loopId = req.query.loopid;
    const type = req.query.type;
    const source = req.query.source;
    const confidence = req.query.confidence;
    const page = req.query.page;
    const limit = req.query.limit;

    const query = {};
    const opts = {};

    paramCDN(cdn, opts);

    if (!paramLoopId(loopId, opts)) {
      callback(Response.returnError(400, 'query parameter [loopid] was not correct, please provide a 24 length MongoDB ObjectId string.'));
      return;
    }
    paramtagType(type, query);
    paramTagSource(source, query);
    if (!paramTagConfidence(confidence, query)) {
      callback(Response.returnError(400, 'query parameter [confidence] parse failed, please provide two float numbers split by \',\'.'));
      return;
    }
    if (!paramPage(page, opts)) {
      callback(Response.returnError(400, 'query parameter [page] parse failed, please provide an integer number.'));
      return;
    }
    if (!paramLimit(limit, opts)) {
      callback(Response.returnError(400, 'query parameter [limit] parse failed, please provide an integer number.'));
      return;
    }

    callback(null, {
      query,
      opts,
    });
  }
}


function paramCDN(cdn, opts) {
  if (cdn) {
    opts.cdn = (cdn === 'true');
  }
  return true;
}
function paramSeriesId(seriesId, query) {
  if (seriesId) {
    if (seriesId.length !== 24) {
      return false;
    }
    query.series = ObjectId(seriesId);
  }
  return true;
}
function paramEpisodeId(episodeId, query) {
  if (episodeId) {
    if (episodeId.length !== 24) {
      return false;
    }
    query.episode = ObjectId(episodeId);
  }
  return true;
}
function paramLoopDuration(duration, query) {
  if (duration) {
    let range = duration.split(',');
    range = range.map(d => parseFloat(d)).filter(d => !isNaN(d));
    if (range.length !== 2 || range[0] > range[1]) {
      return false;
    }

    query.duration = {
      $gt: range[0],
      $lt: range[1],
    };
  }
  return true;
}
function paramLoopSourceFrom(sourceFrom, query) {
  if (sourceFrom) {
    query.sourceFrom = sourceFrom;
  }
  return true;
}
function paramSeriesType(type, query) {
  if (type) {
    query.type = type;
  }
  return true;
}
function paramFull(full, opts) {
  if (full) {
    opts.full = (full === 'true');
  }
  return true;
}
function paramNo(no, query) {
  if (no) {
    query.no = no;
  }
  return true;
}
function paramLimit(limit, opts) {
  if (limit) {
    limit = parseInt(limit, 10);
    if (isNaN(limit)) {
      return false;
    }
    opts.limit = limit;
  }
  return true;
}
function paramPage(page, opts) {
  if (page) {
    page = parseInt(page, 10);
    if (isNaN(page)) {
      return false;
    }
    opts.page = page;
  }
  return true;
}
function paramtagType(type, query) {
  if (type) {
    query.type = type;
  }
  return true;
}
function paramTagSource(source, query) {
  if (source) {
    query.source = source;
  }
  return true;
}
function paramTagConfidence(confidence, query) {
  if (confidence) {
    let range = confidence.split(',');
    range = range.map(d => parseFloat(d)).filter(d => !isNaN(d));
    if (range.length !== 2 || range[0] > range[1]) {
      return false;
    }

    query.confidence = {
      $gt: range[0],
      $lt: range[1],
    };
  }
  return true;
}
function paramLoopId(loopId, query) {
  if (loopId) {
    if (loopId.length !== 24) {
      return false;
    }
    query.loopid = ObjectId(loopId);
  }
  return true;
}

module.exports = Query;
