const express = require('express');
const router = express.Router();
const path = require('path');

const index = require('./routes/index');
const list = require('./routes/list');
const filter = require('./routes/filter');
const api = require('./routes/api');
const about = require('./routes/about');

const episode = require('./routes/episode');
const series = require('./routes/series');
const loop = require('./routes/loop');


router.use(express.static(path.join(__dirname, 'public')));
router.use('/asset', express.static(path.join(__dirname, 'miminium/asset')));


router.use('/', index);
router.use('/list', list);
router.use('/filter', filter);
router.use('/api', api);
router.use('/about', about);

router.use('/episode', episode);
router.use('/series', series);
router.use('/loop', loop);

module.exports = router;