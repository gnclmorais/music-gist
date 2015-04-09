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

      console.log('lastfm:', lastfm);

      // Extend base object (Last.fm's) with MusicBrainz extra info
      var artistfm = lastfm.artist;
      artistfm.area = brainz.area;
      artistfm.type = brainz.type;
      artistfm.relations = brainz.relations;

      // Trim the annoying link for Last.fm at the end
      if (artistfm.bio && artistfm.bio.summary) {
        var lastLink = artistfm.bio.summary.lastIndexOf('<a href=');
        if (lastLink > -1) {
          artistfm.bio.summary = artistfm.bio.summary.slice(0, lastLink);
        }
      }

      // Select playable links to create player(s)
      artistfm.play = [];
      artistfm.play_urls = [];
      artistfm.relations.map(function (link) {
        switch (link.type) {
          case 'soundcloud':
            artistfm.play[0] = 'soundcloud';
            artistfm.play_urls[0] = link.url.resource;
            break;
          case 'vimeo':
            artistfm.play[1] = 'vimeo';
            artistfm.play_urls[1] = link.url.resource;
            break;
          case 'youtube':
            artistfm.play[2] = 'youtube';
            // Special treatment for YouTube links:
            artistfm.play_urls[2] = link.url.resource.split('/user/')[1];
            break;
        }
      });

      // Get only the last (biggest) image
      artistfm.image = artistfm.image.pop()['#text'];

      // Get the tags right
      artistfm.tags = (artistfm.tags || {}).tag || {};

      artistfm.title = artistfm.name;
      res.render('profile', artistfm);
    });
  }
});

module.exports = router;
