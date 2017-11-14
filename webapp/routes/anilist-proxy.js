const express = require('express');
const proxy = require('express-http-proxy');

const router = express.Router();

router.get('/*', proxy('cdn.anilist.co', {
  https: true,
}));

module.exports = router;
