const express = require('express');
const log4js = require('log4js');
const passport = require('passport');
const bodyParser = require('body-parser');
const session = require('express-session');

const logger = log4js.getLogger('api');
const config = require('../../config.js');
const Response = require('./utils/response.js');

const cors = require('../middlewares/cors.js');
const router = require('./router.js');


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(log4js.connectLogger(logger));
app.use(cors);
app.use(passport.initialize());

app.use(session({
  secret: config.apiv2.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 },
}));

app.use('/api/v2', router);

// 400 handler
app.use((req, res) => {
  res.status(400);
  res.json(Response.returnError(400, 'Bad request'));
});

app.listen(config.apiv2.app.port, config.apiv2.app.host, () => {
  logger.info(`app run in ${config.apiv2.app.host}:${config.apiv2.app.port}`);
});
