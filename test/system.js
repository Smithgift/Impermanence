assert = require('assert');
var universe = require('../src/universe');
var system = require('../src/system');

describe('system', function() {
  this.timeout(0);
  
  var System;

  before('setup universe', function(done) {
    var u = universe(web3);
    u.createUniverse(function(galaxy) {
      System = system(web3, galaxy);
      done();
    });
  })

  describe('#empty systems', function() {
    var tauceti;

    before('create empty system', function() {
      tauceti = new System("tauceti");
    });

    it('has a name', function() {
      assert.equal(tauceti.name, "tauceti");
    });

    it('has the right hash', function() {
      assert.equal(tauceti.hash, "0x69807b079150d6528543919a437c8090cc59608e48ff072186c2edbc469c6cb1");
    }); 

    it('has nothing in the map', function() {
      assert.deepEqual(tauceti.map, Array.from({length: 225}, () => 0));
    });
  });
});

