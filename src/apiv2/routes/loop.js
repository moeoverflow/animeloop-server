/* eslint-disable no-underscore-dangle */
const async = require('async');
const express = require('express');

const router = express.Router();
const Response = require('../utils/response.js');
const Database = require('../../core/database.js');
const DBView = require('../utils/dbview.js');
const Query = require('../utils/query.js');

router.get('/', (req, res) => {
  const queryLength = Object.keys(req.query).length;
  const id = req.query.id;
  const collectionId = req.query.collectionid;

  if (queryLength === 1 && id) {
    const query = {};

    if (!Query.paramObjectId(id, '_id', query)) {
      res.json(Response.returnError(400, 'query parameter [id] was not correct, please provide a 24 length MongoDB ObjectId string.'));
      return;
    }

    DBView.findLoop(query, { full: true }, (err, result) => {
      if (err) {
        res.json(err);
        return;
      }
      Response.handleResponse(res)(err, result[0]);
    });
  } else {
    Query.loop(req, (err, data) => {
      if (err) {
        res.json(err);
        return;
      }

      DBView.findLoop(data.query, data.opts, Response.handleResponse(res));
    });
  }

// else if (queryLength === 1 && collectionId) {
//     async.waterfall([
//       (callback) => {
//         const query = { collectionid: collectionId };
//         Database.CollectionLoopModel.find(query, callback);
//       },
//       (ids, callback) => {
//         Query.loop(req, (err, data) => {
//           if (err) {
//             res.json(err);
//             return;
//           }
//
//           data.query._id = {
//             $in: ids.map(id => id.loopid.toString()),
//           };
//           DBView.findLoop(data.query, data.opts, callback);
//         });
//       },
//     ], (err, result) => {
//       if (err) {
//         res.json(Response.returnError(500, 'database error.'));
//         return;
//       }
//
//       Response.handleResponse(res)(null, result);
//     });
//   }
});

router.get('/count', (req, res) => {
  Query.loop(req, (err, data) => {
    if (err) {
      res.json(Response.returnError(400, err));
      return;
    }
    Database.LoopModel.count(data.query, (err, count) => {
      res.send(Response.returnSuccess('success', { count }));
    });
  });
});

module.exports = router;
