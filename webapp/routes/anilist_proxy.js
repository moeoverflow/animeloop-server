const express = require('express');
const router = express.Router();
const proxy = require('express-http-proxy');

router.get('/*', proxy('cdn.anilist.co', {
  https: true
}));

module.exports = router;
