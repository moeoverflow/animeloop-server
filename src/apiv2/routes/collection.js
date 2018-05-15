const async = require('async');
const express = require('express');

const router = express.Router();
const Response = require('../utils/response.js');
const Database = require('../../core/database.js');
const DBView = require('../utils/dbview.js');
const Query = require('../utils/query.js');
const tokenValid = require('../utils/tokenvalid.js');

router.get('/', (req, res) => {
  const queryLength = Object.keys(req.query).length;
  const { id, name, userid } = req.query;

  if (queryLength === 1) {
    const query = {};

    if (id && !Query.paramInt(id, 'cid', query)) {
      res.json(Response.returnError(400, 'query parameter [cid] parse failed, please provide an integer number.'));
      return;
    }

    if (name && !Query.paramExist(name, 'name', query)) {
      res.json(Response.returnError(400, 'query parameter [cid] parse failed, please provide an integer number.'));
      return;
    }

    if (userid && !Query.paramInt(userid, 'userid', query)) {
      res.json(Response.returnError(400, 'query parameter [userid] parse failed, please provide an integer number.'));
      return;
    }

    DBView.findCollection(query, (err, result) => {
      if (err) {
        res.json(err);
        return;
      }
      Response.handleResponse(res)(err, result);
    });
  }
});

router.post('/new', (req, res) => {
  const { title, description, name, token } = req.body;

  if (!name) {
    res.json(Response.returnError(400, 'filed [name] is empty, please provide a string value.'));
    return;
  }

  if (name && !/^\w+$/.test(name)) {
    res.json(Response.returnError(400, 'filed [name] is invalid, please provide a string only contains 26 letters, numbers and underline.'));
    return;
  }

  tokenValid(token, (err, decoded) => {
    if (err) {
      res.json(Response.returnError(400, err));
      return;
    }

    async.waterfall([
      (callback) => {
        Database.LoopCollectionModel.findOne({ name }, (err, doc) => {
          if (err) {
            res.json(Response.returnError(500, 'database error.'));
            return;
          }

          if (doc) {
            callback(Response.returnError(403, 'request forbidden, the collection [id] you provide has already existed.'));
            return;
          }
          callback(null);
        });
      },
      (callback) => {
        const collection = new Database.LoopCollectionModel({
          title,
          description,
          name,
          userid: decoded.uid,
        });
        collection.save((err, doc) => {
          if (err) {
            res.json(Response.returnError(500, 'database error.'));
            return;
          }

          callback(null, Response.returnSuccess(200, 'create loop collection successfully.', {
            id: doc.id,
            cid: doc.cid,
            title: doc.title,
            description: doc.description,
          }));
        });
      },
    ], (err, result) => {
      if (err) {
        res.json(err);
        return;
      }

      res.json(result);
    });
  });
});

router.post('/delete', (req, res) => {
  const { id, token } = req.body;

  tokenValid(token, (err) => {
    if (err) {
      res.json(Response.returnError(400, err));
    }

    async.series([
      (callback) => {
        Database.CollectionLoopModel.remove({ collectionid: id }, callback);
      },
      (callback) => {
        Database.LoopCollectionModel.remove({ cid: id }, callback);
      },
    ], (err) => {
      if (err) {
        res.json(Response.returnError(500, 'failed to delete loop collection.'));
        return;
      }

      res.json(Response.returnSuccess(200, 'delete loop collection successfully.'));
    });
  });
});

router.post('/loop/add', (req, res) => {
  collectionLoopAction(req, res, 'add');
});

router.post('/loop/remove', (req, res) => {
  collectionLoopAction(req, res, 'remove');
});

function collectionLoopAction(req, res, action) {
  const { loopid, collectionid, token } = req.body;

  const query = {};
  if (!Query.paramInt(collectionid, 'collectionid', query)) {
    res.json(Response.returnError(400, '[collectionid] is not correct, please provide a integer number.'));
    return;
  }
  if (!parseLoopIds(loopid, (err, ids) => {
    if (err) {
      res.json(err);
      return;
    }

    query.items = ids.map(id => ({
      loopid: id,
      collectionid: query.collectionid,
    }));
  })) {
    return;
  }

  tokenValid(token, (err, encoded) => {
    if (err) {
      res.json(Response.returnError(400, err));
    }

    const { uid } = encoded;

    async.waterfall([
      (callback) => {
        Database.LoopCollectionModel.findOne({ cid: query.collectionid }, (err, doc) => {
          if (err) {
            callback(Response.returnError(500, 'database error.'));
            return;
          }

          if (!doc) {
            callback(Response.returnError(404, 'collection do not exist.'));
            return;
          }

          if (doc.userid !== uid) {
            callback(Response.returnError(400, 'unauthorized.'));
            return;
          }
          callback(null);
        });
      },
      (callback) => {
        if (action === 'add') {
          async.series(query.items.map(item => (callback) => {
            Database.CollectionLoopModel.update(item, {
              $set: item,
            }, {
              upsert: true,
            }, callback);
          }), (err, result) => {
            if (err) {
              callback(Response.returnError(500, 'database error.'));
              return;
            }
            callback(null, result);
          });
        } else if (action === 'remove') {
          async.series(query.items.map(item => (callback) => {
            Database.CollectionLoopModel.remove(item, callback);
          }), (err, result) => {
            if (err) {
              callback(Response.returnError(500, 'database error.'));
            }
            callback(null, result);
          });
        } else {
          callback(Response.returnError(400, 'bad request.'));
        }
      },
    ], (err) => {
      if (err) {
        res.json(err);
        return;
      }

      res.json(Response.returnSuccess(200, 'add item to collection successfully.'));
    });
  });
}

function parseLoopIds(loopids, callback) {
  if (!loopids) {
    callback(Response.returnError(400, '[loopid] is empty, please provide one or array of 24 length MongoDB ObjectId string.'));
    return false;
  }
  let ids = [];
  try {
    ids = JSON.parse(loopids);
    if (!Array.isArray(ids)) {
      ids = [loopids];
    }
  } catch (e) {
    ids = [loopids];
  }
  if (!ids.reduce((flag, current) => (
      flag && Query.paramObjectId(current, '', {}))
      , true)) {
    callback(Response.returnError(400, '[loopid] is not correct, please provide one or array of 24 length MongoDB ObjectId string.'));
    return false;
  }
  callback(null, ids);
  return true;
}

module.exports = router;
