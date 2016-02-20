var universe = require("../frontend/universe");

describe('universe', function() {
  var u;
  before('setup web3', function() {
    u = universe(web3);
  });

  it('creates shipLibs', function(done) {
    u.createShipLib(done);
  })
});
