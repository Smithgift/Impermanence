var assert = require("assert");
var universe = require("../src/universe");
var build = require("../build/contracts.js");

describe('universe', function() {
  this.timeout(10000);

  var u;
  before('setup web3', function() {
    u = universe(web3);
  });

  it('creates ShipLibs', function(done) {
    u.createShipLib(function(shipLib) {
      assert.notEqual(web3.eth.getCode(shipLib.address), "0x");
      done();
    });
  });

  it('creates Galaxies', function(done) {
    u.createShipLib(function(shipLib) {
      u.createGalaxy(shipLib, function(galaxy) {
        assert.notEqual(web3.eth.getCode(galaxy.address), "0x");
        done();
      });
    })
  });

  it('creats Universes', function(done) {
    u.createUniverse(function() {done()});
  })
});
