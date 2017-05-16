const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('filter', { pageType: 'filter' });
});

module.exports = router;
