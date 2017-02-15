var universe = require('../src/universe');
var system = require('../src/system');

describe.skip('ship', function() {
  this.timeout(0);

  var System;
  var galaxy;

  var sol;

  before('setup universe', function(done) {
    var u = universe(web3);
    u.createUniverse().then(function(_galaxy) {
      galaxy = _galaxy;
      System = system(web3, galaxy);
      done();
    });
  })

  before('create Sol', function(done) {
    sol = new System('Sol');
    sol.create().then(function() {
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  describe('cranes', function() {
    var crane;

    before('create the crane', function(done) {
      sol.spawnCrane(39, "crane").then(function(_crane) {
        crane = _crane;
        done();
      }).catch(function() {
        done(err);
      });
    });

    it('is something', function() {
      assert.notEqual(typeof crane, "undefined");
    });

  });

});
