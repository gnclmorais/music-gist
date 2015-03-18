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
    ], function (err, res) {
      console.log(res);

      //res.render('profile', response);
    });
  }
});

module.exports = router;
