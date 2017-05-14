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

// app.use(favicon(path.join(__dirname, 'webapp/public/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/files', express.static(path.join(__dirname, 'storage', 'data')));

app.use(webRouter);
app.use(apiRouter);


// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }

// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: {}
//   });
// });


// ALManager
const alManager = new ALManager();

app.listen(config.app.port, config.app.host, () => {
  console.log("app run in " + config.app.host + ":" + config.app.port);
});
