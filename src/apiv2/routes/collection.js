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
  const { id, userid } = req.query;

  if (queryLength === 1) {
    const query = {};

    if (id && !Query.paramInt(id, 'cid', query)) {
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
  const { title, description, token } = req.body;

  tokenValid(token, (err, decoded) => {
    if (err) {
      res.json(Response.returnError(400, err));
    }

    const collection = new Database.CollectionModel({
      title,
      description,
      userid: decoded.uid,
      item: 'loop',
    });

    collection.save((err, doc) => {
      if (err) {
        res.json(Response.returnError(500, 'database error.'));
        return;
      }

      res.json(Response.returnSuccess('create loop collection successfully.', {
        id: doc.cid,
        title: doc.title,
        description: doc.description,
        type: doc.type,
        itemType: doc.itemType,
      }));
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
      (result, callback) => {
        Database.CollectionModel.remove({ cid: id }, callback);
      },
    ], (err) => {
      if (err) {
        res.json(Response.returnError(500, 'failed to delete loop collection.'));
        return;
      }

      res.json(Response.returnSuccess('delete loop collection successfully.'));
    });
  });
});

router.post('/item/add', (req, res) => {
  const {  }

});

router.post('/item/remove', (req, res) => {

});

module.exports = router;
