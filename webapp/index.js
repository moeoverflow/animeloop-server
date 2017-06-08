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
router.use('/miminium', express.static(path.join(__dirname, 'modules/miminium/asset')));
router.use('/lazy-load-xt', express.static(path.join(__dirname, 'modules/lazy-load-xt/dist')));
router.use('/hammerjs', express.static(path.join(__dirname, 'modules/hammerjs')));
router.use('/modernizr', express.static(path.join(__dirname, 'modules/modernizr')));
router.use('/share.js', express.static(path.join(__dirname, 'modules/share.js')));
router.use('/pressure', express.static(path.join(__dirname, 'modules/pressure/dist')));
router.use('/animate.css', express.static(path.join(__dirname, 'modules/animate.css')));



router.use('/', index);
router.use('/list', list);
router.use('/filter', filter);
router.use('/api', api);
router.use('/about', about);

router.use('/episode', episode);
router.use('/series', series);
router.use('/loop', loop);

module.exports = router;