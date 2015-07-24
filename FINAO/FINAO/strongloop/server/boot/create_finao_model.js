var async = require('async');

module.exports = function(app) {
  // data sources
  var finaoDs = app.dataSources.FINAODs;
 
  // create all models
  async.parallel({
    //tiles: async.apply(createTiles)
  }, function(err, results) {
    if (err) throw err;

      console.log('> models created sucessfully');
    });

  //Create Tiles
  function createTiles(cb) {
      finaoDs.autoupdate('tile', function (err) {
          if (err) return cb(err);
          app.models.Tile.create([
              {_id: 5, name: 'financial', description:'financial'},
          ], cb);
      });
  };
};
