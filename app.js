const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const ALManager = require('./manager/almanager');
const config = require('./config');

const webRouter = require('./webapp/index');
const apiRouter = require('./api/api');

const app = express();

app.set('views', path.join(__dirname, 'webapp','views'));
app.set('view engine', 'ejs');
app.locals.googleAnalytics = config.googleAnalytics;

// app.use(favicon(path.join(__dirname, 'webapp/public/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/files', express.static(config.storage.dir.data));

app.use(webRouter);
app.use(apiRouter);

// 404 handler
app.use((req, res, next) => {
  res.status(404).render('404');
});

alManager = new ALManager();

app.listen(config.app.port, config.app.host, () => {
  console.log("app run in " + config.app.host + ":" + config.app.port);
});
