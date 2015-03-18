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

      console.log(brainz);
      console.log(lastfm);
      console.log(lastfm.artist.image);

      // Extend base object (Last.fm's) with MusicBrainz extra info
      var artistfm = lastfm.artist;
      artistfm.area = brainz.area;
      console.log('Tyyype:', brainz, brainz.type);
      artistfm.type = brainz.type;
      artistfm.relations = brainz.relations;

      // Prepare links to play
      artistfm.play = [];
      artistfm.relations.forEach(function (link) {
        if (link.type === 'soundcloud') {
          artistfm.play.push(link);
        }
      });
      artistfm.play = artistfm.relations.slice().sort(function (a, b) {
        console.log(a.type + ' — ' + b.type);

        switch (a.type) {
          case 'soundcloud':
            return 0;
          case 'youtube':
            return 1;
          case 'vimeo':
            return 2;
          default:
            return 100;
        }
      });
      console.log('Sorted:', artistfm.play);

      // Get only the last (biggest) image
      artistfm.image = artistfm.image.pop()['#text'];

      res.render('profile', artistfm);
    });
  }
});

module.exports = router;
