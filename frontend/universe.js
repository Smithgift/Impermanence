module.exports = function(web3) {
  var exports = {};
  var build = require("../build/contracts.js");

  var ShipLibBin = "0x" + build.contracts.ShipLib.bin;
  var ShipLib = web3.eth.contract(JSON.parse(build.contracts.ShipLib.abi));

  function createShipLib(callback) {
    ShipLib.new(
      {data: ShipLibBin, gas: 3000000}, 
      function(err, newShipLib) {
        if(err) {
          throw err;
        }
        if(newShipLib.address) {
          callback(newShipLib);
        }
      }
    );
  }
  exports.createShipLib = createShipLib;

  var GalaxyBin = "0x" + build.contracts.Galaxy.bin;
  var Galaxy = web3.eth.contract(JSON.parse(build.contracts.Galaxy.abi));

  function createGalaxy(shipLib, callback) {
    // Runtime linking! Right before your very eyes!
    var linkedGalaxyCode = GalaxyBin.replace(
        /_+ShipLib_+/g,
      shipLib.address.replace("0x", "")
    );
    Galaxy.new(
      {data: linkedGalaxyCode, gas: 3141592}, 
      function(err, newGalaxy) {
        if(err) {
          throw err;
        }
        if(newGalaxy.address) {
          callback(newGalaxy);
        }
      }
    );    
  }

  exports.createGalaxy = createGalaxy;

  // Create both a shipLib and a galaxy.
  function createUniverse(callback) {
    createShipLib(function(shipLib) { 
      createGalaxy(shipLib, callback);
    });
  }

  exports.createUniverse = createUniverse;

  // For easy development.
  exports.cu = function() { 
    createUniverse(function() {
      console.log("Ready!")
    })
  }
  return exports;
}
