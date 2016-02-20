var assert = require("assert");
var universe = require("../frontend/universe");
var build = require("../build/contracts.js");

describe('universe', function() {
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
});
