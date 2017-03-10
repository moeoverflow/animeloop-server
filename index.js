let  app = require('./app.js'),
  config = require('./config.js');


app.listen(config.port, (err) => {
  if (err) { throw err }
  console.log('Listening at port ' + config.port);
});