var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {
  if (req.body && req.body.artist) {
    res.redirect(req.baseUrl + '/' + req.body.artist);
  } else {
    // TODO
  }
});

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
      // TODO
      return;
    }

    // - No artist/band found -> Warn the user
    // - A single artist/bad was found -> Show its profile
    // - Several artists/bans with the same name -> Ask the user which one
    switch (response.count) {
      case 1:
        var artist = response.artists[0];
        res.redirect('/artist/' + artist.id);
        break;
      case 0:
        // TODO
      default:
        // Get the proper country names
        artists = response.artists.map(function (artist) {
          if (artist.country) {
            var name = req.countries[artist.country].name;
            artist.countryName = name || artist.country;
          }
        });

        res.render('search_results', {
          title: name,
          count: response.count,
          results: response.artists
        });
    }
  });
});

module.exports = router;
