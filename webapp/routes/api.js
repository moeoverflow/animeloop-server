const express = require('express');
const router = express.Router();
const markdown = require( "markdown" ).markdown;
const fs = require('fs');
const path = require('path');

router.get('/', (req, res, next) => {
  var filename = path.join(__dirname, `../content/post/${res.__('api-md-file')}`);

  if (!fs.existsSync(filename)) {
    filename = path.join(__dirname, `../content/post/api_en.md`);
  }

  fs.readFile(filename, 'UTF-8', (err, data) => {
    var post = '';

    if (!err) {
      post = markdown.toHTML(data);
    }

    res.render('api', {
      pageType: 'api',
      post
    });
  });
});

module.exports = router;
