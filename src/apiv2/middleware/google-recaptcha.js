const express = require('express');
const request = require('request');

const router = express.Router();
const Response = require('../utils/response.js');
const config = require('../../../config.js');


router.use((req, res, next) => {
  const errorResponse = Response.returnError(1940101, 'Google reCAPTCHA verification failed.')

  if (!req.body['g-recaptcha-response']) {
    res.json(errorResponse);
    return;
  }

  const url = config.recaptcha.url;
  const form = {
    secret: config.recaptcha.secret,
    response: req.body['g-recaptcha-response'],
    remoteip: req.connection.remoteAddress,
  };

  request.post(url, { form }, (err, httpResponse, body) => {
    if (err) {
      res.json(errorResponse);
      return;
    }

    const data = JSON.parse(body);
    if (!data.success) {
      res.json(errorResponse);
      return;
    }

    next();
  });
});

module.exports = router;
