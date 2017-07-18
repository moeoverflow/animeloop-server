const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const restify = require('express-restify-mongoose');
const router = express.Router();
const config = require('../config');

const DatabaseHandler = require('../manager/databasehandler');
const FileHandler = require('../manager/filehandler');

router.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', false);

  // Pass to next layer of middleware
  next();
});

restify.serve(router, DatabaseHandler.LoopModel, {
  name: 'loops',
  preDelete: (req, res, next) => {
    res.status(401);
  },
  preCreate: (req, res, next) => {
    res.status(401);
  },
  preUpdate: (req, res, next) => {
    res.status(401);
  },
  outputFn: (req, res) => {
    var result = req.erm.result;
    const statusCode = req.erm.statusCode;

    if (result instanceof Array) {
      res.status(statusCode).json(result.map((r) => {
        r.files = FileHandler.getFilesUrl(r._id);
        return r;
      }));
    } else if (result instanceof Object) {
      result.files = FileHandler.getFilesUrl(result._id);
      res.status(statusCode).json(result);
    }
  }
});


router.get('/api/rand', (req, res) => {
  alManager.getRandomLoops(1, (err, loops) => {
    if (err) {
      res.json({
        error: err
      });
      return;
    }
    res.json(loops[0]);
  });
});


router.post('/api/like', (req, res) => {

});

router.post('/api/unlike', (req, res) => {

});

router.post('/api/fav', (req, res) => {

});


module.exports = router;