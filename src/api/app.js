const express = require('express');
const log4js = require('log4js');

const logger = log4js.getLogger('api');
const config = require('../../config.js');
const Response = require('./utils/response.js');

const cors = require('../middlewares/cors.js');
const router = require('./router.js');


const app = express();

app.use(log4js.connectLogger(logger));
app.use(cors);

app.use(`/api/${config.api.version}`, router);

// 400 handler
app.use((req, res) => {
  res.status(400);
  res.json(Response.returnError(400, 'Bad request'));
});

app.listen(config.api.app.port, config.api.app.host, () => {
  logger.info(`app run in ${config.api.app.host}:${config.api.app.port}`);
});
