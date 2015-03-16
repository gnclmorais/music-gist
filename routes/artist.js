var express = require('express');
var router = express.Router();

/* GET artist page by MusicBrainz ID. */
router.get('/:mbid', function (req, res, next) {
  var mb = req.mb;
  var mbid = req.params.mbid;

  if (mbid) {
    mb.artist(mbid, {
      inc: 'url-rels'  // Includes URL relations
    }, function (err, response) {
      if (err) {
        // TODO
        return;
      }

      console.log(response);

      res.render('profile', response);
    });
  }
});

module.exports = router;
