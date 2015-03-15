var express = require('express');
var router = express.Router();

/* GET search artist or band. */
router.get('/:name', function (req, res, next) {
  var mb = req.mb;
  var name = req.params.name;

  // no string to search for
  if (!name) {
    // TODO
  }

  mb.search('artist', {artist: name}, function (err, response) {
    if (err) {
      return;
    }

    console.log('Results:\n', response)

    // - No artist/band found -> Warn the user
    // - A single artist/bad was found -> Show its profile
    // - Several artists/bans with the same name -> Ask the user which one
    switch (response.count) {
      case 0:
        // TODO
        break;
      case 1:
        res.render('profile', {
          title: name
        });
        break;
      default:
        res.render('search_results', {
          title: name,
          count: response.count,
          results: response.artists
        });
    }
  });
});

module.exports = router;
