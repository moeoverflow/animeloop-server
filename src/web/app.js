const express = require('express');
const path = require('path');
const log4js = require('log4js');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const logger = log4js.getLogger('webapp');
const config = require('../../config');
const webRouter = require('./router.js');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.locals.googleAnalytics = config.googleAnalytics;

app.use(log4js.connectLogger(logger, {
  level: 'auto',
  format: ':method :url :status',
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/files', express.static(config.storage.dir.data));

app.use(webRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(config.app.port, config.app.host, () => {
  logger.info(`app run in ${config.app.host}:${config.app.port}`);
});

module.exports = app;
