const express = require('express');
const router = express.Router();
const markdown = require( "markdown" ).markdown;
const fs = require('fs');
const path = require('path');

router.get('/', (req, res, next) => {
  var filename = path.join(__dirname, `../content/post/${res.__('about-md-file')}`);

  if (!fs.existsSync(filename)) {
    filename = path.join(__dirname, `../content/post/about_en.md`);
  }

  fs.readFile(filename, 'UTF-8', (err, data) => {
    var post = '';

    if (!err) {
      post = markdown.toHTML(data);
    }

    res.render('about', {
      pageType: 'about',
      post
    });
  });
});

module.exports = router;
