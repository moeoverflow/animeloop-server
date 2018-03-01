/* eslint-disable no-underscore-dangle */
const express = require('express');
const sm = require('sitemap');

const router = express.Router();
const config = require('../../../config.js');
const Database = require('../../core/database.js');

const maxUrls = 50000;

router.get('/sitemap-loop-:no.xml', (req, res) => {
  const no = req.params.no;
  const n = parseInt(no, 10);
  if (isNaN(n)) {
    res.status(404);
    return;
  } else if (n === 0) {
    res.status(404);
    return;
  }

  Database.LoopModel
    .find({})
    .skip((n - 1) * maxUrls)
    .limit(maxUrls)
    .populate('series episode')
    .exec((err, docs) => {
      const data = docs.map(doc => ({
        url: `/loop/${doc._id}`,
        changefreq: 'monthly',
        img: [{ url: `${config.app.url}/files/gif_360p/${doc._id}.gif` }],
        video: [{
          thumbnail_loc: `${config.app.url}/files/jpg_720p/${doc._id}.mp4`,
          title: `${doc.series.title_japanese} ${doc.episode.no}`,
          description: `${doc.series.title_japanese} ${doc.episode.no}`,
        }],
        links: [
          { lang: 'jp', url: `${config.app.url}/loop/${doc._id}?lang=jp` },
          { lang: 'en', url: `${config.app.url}/loop/${doc._id}?lang=en` },
          { lang: 'fr', url: `${config.app.url}/loop/${doc._id}?lang=fr` },
          { lang: 'fr', url: `${config.app.url}/loop/${doc._id}?lang=zh` },
        ],
      }));

      xml(data, res);
    });
});

router.get('/sitemap-episode.xml', (req, res) => {
  Database.EpisodeModel.find({}, (err, docs) => {
    const data = docs.map(doc => ({
      url: `/episode/${doc._id}`,
      changefreq: 'weekly',
      links: [
        { lang: 'jp', url: `${config.app.url}/episode/${doc._id}?lang=jp` },
        { lang: 'en', url: `${config.app.url}/episode/${doc._id}?lang=en` },
        { lang: 'fr', url: `${config.app.url}/episode/${doc._id}?lang=fr` },
        { lang: 'fr', url: `${config.app.url}/episode/${doc._id}?lang=zh` },
      ],
    }));

    xml(data, res);
  });
});

router.get('/sitemap-series.xml', (req, res) => {
  Database.SeriesModel.find({}, (err, docs) => {
    const data = docs.map(doc => ({
      url: `/series/${doc._id}`,
      changefreq: 'monthly',
      img: [{ url: doc.image_url_large }],
      links: [
        { lang: 'jp', url: `${config.app.url}/series/${doc._id}?lang=jp` },
        { lang: 'en', url: `${config.app.url}/series/${doc._id}?lang=en` },
        { lang: 'fr', url: `${config.app.url}/series/${doc._id}?lang=fr` },
        { lang: 'fr', url: `${config.app.url}/series/${doc._id}?lang=zh` },
      ],
    }));

    xml(data, res);
  });
});

function xml(data, res) {
  const sitemap = sm.createSitemap({
    hostname: config.app.url,
    urls: data,
  });

  sitemap.toXML((err, xml) => {
    if (err) {
      return res.status(500).end();
    }
    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  });
}

module.exports = router;
