'use strict';
const express = require('express'),
         path = require('path');

let app = express();

/**
 * Configuring express
 */
app.set('view engine', 'ejs');
app.set(path.join(__dirname, 'views'));

module.exports = app;