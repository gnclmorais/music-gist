var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var countries  = require('country-data').countries;
var fs = require('fs');
var nconf = require('nconf');

//nconf.file({ file: 'config.json' });
nconf.env();

// get musicbrainz wrapper and initialise a client
var nb = require('nodebrainz');
var mb = new nb({
  userAgent:'musig-gist/0.0.1 ( https://github.com/gnclmorais/music-gist )'
});

// get Last.fm wrapper and initialise a client
var LastFmNode = require('lastfm').LastFmNode;
var fm = new LastFmNode({
  api_key: nconf.get('lastfm_apikey'),
  secret: nconf.get('lastfm_secret'),
  useragent: 'music-gist/v0.0.1'
});

// get available routes
var routes = require('./routes/index');
var search = require('./routes/search');
var artist = require('./routes/artist');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// make our MusicBrainz client accessible to our router
app.use(function (req, res, next) {
    req.mb = mb;
    req.fm = fm;
    req.countries = countries;
    next();
});

// set routes
app.use('/', routes);
app.use('/search', search);
app.use('/artist', artist);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
