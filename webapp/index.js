const express = require('express');

const router = express.Router();

const index = require('./routes/index');
const view = require('./routes/view');


router.use('/', index);



module.exports = router;