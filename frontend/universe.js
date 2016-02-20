module.exports = function(web3) {
  var exports = {};
  var build = require("./build");

  var ShipLibBin = "0x" + build.contracts.ShipLib.bin;
  var ShipLib = web3.eth.contract(JSON.parse(build.contracts.ShipLib.abi));

  function createShipLib(callback) {
    exports.shipLib = ShipLib.new(
      {data: ShipLibBin, gas: 3000000}, 
      function(err, newShipLib) {
        if(err) {
          console.log(err);
          return;
        }
        if(newShipLib.address) {
          callback();
        }
      }
    );
  }
  exports.createShipLib = createShipLib;

  var GalaxyBin = "0x" + build.contracts.Galaxy.bin;
  var Galaxy = web3.eth.contract(JSON.parse(build.contracts.Galaxy.abi));

  function createGalaxy(callback) {
    if(typeof exports.shipLib.address === undefined) {
      throw new Error("No shipLib exists.");
    }
    // Runtime linking! Right before your eyes!
    var linkedGalaxyCode = GalaxyBin.replace(
        /_+ShipLib_+/g,
      exports.shipLib.address.replace("0x", "")
    );
    exports.galaxy = Galaxy.new(
      {data: linkedGalaxyCode, gas: 3141592}, 
      function(err, newGalaxy) {
        if(err) {
          console.log(err);
          return;
        }
        if(newGalaxy.address) {
          callback();
        }
      }
    );    
  }

  exports.createGalaxy = createGalaxy;

  function createUniverse(callback) {
    if(typeof shipLib === "undefined") {
      createShipLib(function() { 
        createGalaxy(callback);
      });
    } else {
      createGalaxy(callback);
    }
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
