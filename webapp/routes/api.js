const express = require('express');
const router = express.Router();
const markdown = require( "markdown" ).markdown;
const fs = require('fs');
const path = require('path');

router.get('/', (req, res, next) => {
  fs.readFile(path.join(__dirname, '../content/post/api.md'), 'UTF-8', (err, data) => {
    var post = '';

    if (!err) {
      post = markdown.toHTML(data);
    }

    res.render('api', {
      activeMenu: 'api',
      post
    });
  });
});

module.exports = router;
