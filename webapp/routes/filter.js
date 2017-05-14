const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('filter', { activeMenu: 'filter' });
});

module.exports = router;
