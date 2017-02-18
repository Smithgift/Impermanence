var Promise = require('bluebird');

module.exports = function(web3) {
  var exports = {};
  var build = require("../build/contracts.js");

  var ShipLibBin = "0x" + build.contracts.ShipLib.bin;
  var ShipLib = web3.eth.contract(JSON.parse(build.contracts.ShipLib.abi));

  function createShipLib() {
    return new Promise(function(resolve, reject) { 
      ShipLib.new(
        {data: ShipLibBin, gas: 3000000}, 
        function(err, newShipLib) {
          if(err) {
            reject(err);
            return;
          }
          if(newShipLib.address) {
            resolve(newShipLib);
          }
        });
    });
  }
  exports.createShipLib = createShipLib;

  var GalaxyBin = "0x" + build.contracts.Galaxy.bin;
  var Galaxy = web3.eth.contract(JSON.parse(build.contracts.Galaxy.abi));

  function createGalaxy(shipLib) {
    // Runtime linking! Right before your very eyes!
    var linkedGalaxyCode = GalaxyBin.replace(
        /_+ShipLib_+/g,
      shipLib.address.replace("0x", "")
    );
    return new Promise(function(resolve, reject) {
      Galaxy.new(
        {data: linkedGalaxyCode, gas: 3141592}, 
        function(err, newGalaxy) {
          if(err) {
            reject(err);
            return;
          }
          if(newGalaxy.address) {
            resolve(Promise.promisifyAll(newGalaxy));
          }
        }
      );
    }); 
  }

  exports.createGalaxy = createGalaxy;

  // Create both a ShipLib and a Galaxy.
  function createUniverse() {
    return createShipLib().then(createGalaxy);
  }

  exports.createUniverse = createUniverse;

  function linkGalaxy(address) {
    return Promise.promisifyAll(Galaxy.at(address));
  }

  exports.linkGalaxy = linkGalaxy;

  return exports;
}
