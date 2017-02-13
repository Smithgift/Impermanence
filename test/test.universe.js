var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var assert = chai.assert;

var universe = require('../src/universe');
var build = require('../build/contracts.js');

describe('universe', function() {
  this.timeout(0);

  var u;
  before('setup web3', function() {
    u = universe(web3);
  });

  it('creates ShipLibs', function() {
    return assert.eventually.notEqual(
      u.createShipLib()
        .then((shipLib) => web3.eth.getCodeAsync(shipLib.address)),
      "0x"
    );
  });

  it('creates Galaxies', function() {
    return assert.eventually.notEqual(
      u.createShipLib()
        .then((shipLib) => u.createGalaxy(shipLib))
        .then((galaxy) => web3.eth.getCodeAsync(galaxy.address)),
      "0x"
    );
  });

  it('creates Universes', function() {
    return assert.eventually.notEqual(
      u.createUniverse()
        .then((galaxy) => web3.eth.getCodeAsync(galaxy.address)),
      "0x"
    );
  })

  it('connects to existing Galaxies', function() {
    return assert.eventually.isOk(u.createUniverse().then((galaxy) => {
          var _galaxy = u.linkGalaxy(galaxy.address);
          return galaxy.prototype === _galaxy.prototype;
    }));
  });
});
