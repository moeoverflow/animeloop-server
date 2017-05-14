const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const restify = require('express-restify-mongoose');
const router = express.Router();
const config = require('../config');

const DatabaseHandler = require('../manager/databasehandler');

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



function getFilesUrl(id) {
  return {
    mp4_1080p: config.app.url + '/files/mp4_1080p/' + id + '.mp4',
    webm_1080p: config.app.url + '/files/webm_1080p/' + id + '.webm',
    jpg_1080p: config.app.url + '/files/jpg_1080p/' + id + '.jpg',
    jpg_720p: config.app.url + '/files/jpg_720p/' + id + '.jpg',
    gif_360p: config.app.url + '/files/gif_360p/' + id + '.gif'
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


router.post('/api/like', (req, res) => {

});

router.post('/api/unlike', (req, res) => {

});

router.post('/api/fav', (req, res) => {

});


module.exports = router;