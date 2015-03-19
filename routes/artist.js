var express = require('express');
var async = require('async');
var router = express.Router();

/* GET artist page by MusicBrainz ID. */
router.get('/:mbid', function (req, res, next) {
  var mb = req.mb;
  var fm = req.fm;
  var mbid = req.params.mbid;

  // From Spotify, ask songs


  if (mbid) {
    async.parallel([
      function (callback) {
        // From MusicBrainz, ask social links
        mb.artist(mbid, {
          inc: 'url-rels'  // Includes URL relations
        }, function (err, response) {
          if (err) {
            callback(err);
            return err;
          }

          callback(null, response);
          return response;
        });
      },
      function (callback) {
        // From Last.fm, ask tags/genres
        fm.request('artist.getInfo', {
          mbid: mbid,
          handlers: {
            success: function (data) {
              callback(null, data);
              return data;
            },
            error: function (error) {
              callback(error);
              return error;
            }
          }
        });
      }
    ], function (err, response) {
      var brainz = response[0];
      var lastfm = response[1];

      // Extend base object (Last.fm's) with MusicBrainz extra info
      var artistfm = lastfm.artist;
      artistfm.area = brainz.area;
      artistfm.type = brainz.type;
      artistfm.relations = brainz.relations;

      // Select playable links to create player(s)
      artistfm.play = {};
      artistfm.relations.map(function (link) {
        switch (link.type) {
          case 'vimeo':
          case 'myspace':
          case 'youtube':
          case 'soundcloud':
            artistfm.play[link.type] = link.url.resource;
        }
      });

      // Get only the last (biggest) image
      artistfm.image = artistfm.image.pop()['#text'];

      res.render('profile', artistfm);
    });
  }
});

module.exports = router;
