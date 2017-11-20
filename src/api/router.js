const express = require('express');

const router = express.Router();

const netdata = require('../core/utils/netdata');

const rand = require('./routes/rand.js');
const loop = require('./routes/loop.js');
const episode = require('./routes/episode.js');
const series = require('./routes/series.js');
const tag = require('./routes/tag.js');

router.use('/netdata', netdata);
router.use('/rand', rand);
router.use('/loop', loop);
router.use('/episode', episode);
router.use('/series', series);
router.use('/tag', tag);


module.exports = router;
