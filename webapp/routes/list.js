const express = require('express');
const router = express.Router();

router.get('/tags', (req, res, next) => {
  res.render('list', {
    pageType: 'list-tags',
    datas: []
  });
});

module.exports = router;
