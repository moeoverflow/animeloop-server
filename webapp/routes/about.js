const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('about', { activeMenu: 'about' });
});

module.exports = router;
