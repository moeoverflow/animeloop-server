const express = require('express');
const Markdown = require('markdown');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const markdown = Markdown.markdown;

router.get('/', (req, res) => {
  // eslint-disable-next-line no-underscore-dangle
  let filename = path.join(__dirname, `../content/post/${res.__('about-md-file')}`);

  if (!fs.existsSync(filename)) {
    filename = path.join(__dirname, '../content/post/about_en.md');
  }

  fs.readFile(filename, 'UTF-8', (err, data) => {
    let post = '';

    if (!err) {
      post = markdown.toHTML(data);
    }

    res.render('about', {
      pageType: 'about',
      post,
    });
  });
});

module.exports = router;
