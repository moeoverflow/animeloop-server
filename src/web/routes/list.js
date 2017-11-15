const express = require('express');
const router = express.Router();

router.get('/tags', (req, res) => {
  res.render('list', {
    pageType: 'list-tags',
    datas: [],
  });
});

module.exports = router;
