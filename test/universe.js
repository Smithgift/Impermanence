var assert = require('assert');
var universe = require('../src/universe');
var build = require('../build/contracts.js');

describe('universe', function() {
  this.timeout(0);

  var u;
  before('setup web3', function() {
    u = universe(web3);
  });

  it('creates ShipLibs', function(done) {
    u.createShipLib().then(function(shipLib) {
      assert.notEqual(web3.eth.getCode(shipLib.address), "0x");
      done();
    }).catch(function(err) {
      assert.fail(err);
    });
  });

  it('creates Galaxies', function(done) {
    u.createShipLib().then(function(shipLib) {
      return u.createGalaxy(shipLib);
    }).then(function(galaxy) {
      assert.notEqual(web3.eth.getCode(galaxy.address), "0x");
      done();
    });
  });

  it('creates Universes', function(done) {
    u.createUniverse().then(function(galaxy) {
      assert.notEqual(web3.eth.getCode(galaxy.address), "0x");     
      done();
    });
  })

  it('connects to existing Galaxies', function(done) {
    u.createUniverse().then(function(galaxy) {
      var _galaxy = u.linkGalaxy(galaxy.address);
      // TODO: Determine that it actually is a galaxy.
      // Like, I'm sure this helps:
      assert.equal(
        web3.eth.getCode(galaxy.address), 
        web3.eth.getCode(_galaxy.address)
      );
      // I'd just hope there'd be more.
      done();
    })
  });
});
