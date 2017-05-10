const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const Schema = mongoose.Schema;
const restify = require('express-restify-mongoose');
const router = express.Router();
const config = require('../config');

const DatabaseHandler = require('../manager/databasehandler');

function getFilesUrl(id) {
  return {
    mp4_1080p: config.app.url + '/files/mp4_1080p/' + id + '.mp4',
    jpg_1080p: config.app.url + '/files/jpg_1080p/' + id + '.jpg'
  };
}

// restify.serve(router, DatabaseHandler.LoopModel, {
//   name: 'loops',
//   preDelete: (req, res, next) => {
//     res.status(401);
//   },
//   preCreate: (req, res, next) => {
//     res.status(401);
//   },
//   preUpdate: (req, res, next) => {
//     res.status(401);
//   },
//   outputFn: (req, res) => {
//     const result = req.erm.result;
//     const statusCode = req.erm.statusCode;
//
//     res.status(statusCode).json(result.map((r) => {
//       r.files = getFilesUrl(r._id);
//       return r;
//     }));
//   }
// });


router.get('/api/rand', (req, res) => {
  DatabaseHandler.LoopModel.findOneRandom((err, loop) => {
    var result = loop.toObject();
    result.__v = undefined;
    result.md5 = undefined;
    result.files = getFilesUrl(result._id);
    res.json(result);
  });

});

module.exports = router;