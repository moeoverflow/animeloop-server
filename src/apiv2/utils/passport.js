const passport = require('passport');
const jwt = require('jwt-simple');

const Database = require('../../core/database.js');

const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const config = require('../../../config.js');


passport.use(new LocalStrategy((username, password, done) => {
  Database.UserModel.findOne({ username }, (err, user) => {
    if (err) {
      return done(err);
    }

    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    if (!user.validPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  });
}));

passport.use(new BearerStrategy((token, done) => {
  var decoded = jwt.decode(token, config.auth.secret);

  Database.UserModel.findOne({ token }, (err, user) => {
    if (err) {
      return done(err);
    }

    if (!user) {
      done(null, false);
    }

    if (decoded.username !== user.username) {
      return done(null, false);
    }

    return done(null, { scope: 'all' });
  });
}));
