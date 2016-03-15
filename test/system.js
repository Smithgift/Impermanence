var assert = require('chai').assert;
var universe = require('../src/universe');
var system = require('../src/system');

describe('system', function() {
  this.timeout(0);
  
  var System;
  var galaxy;

  before('setup universe', function(done) {
    var u = universe(web3);
    u.createUniverse().then(function(_galaxy) {
      galaxy = _galaxy;
      System = system(web3, galaxy);
      done();
    });
  })

  describe('#empty system', function() {
    var tauceti;

    before('create empty system', function() {
      tauceti = new System("tauceti");
    });

    it('does not exist', function() {
      assert.equal(tauceti.exists(), false);
    })

    it('has a name', function() {
      assert.equal(tauceti.name, 'tauceti');
    });

    it('has the right hash', function() {
      assert.equal(tauceti.hash, "0x69807b079150d6528543919a437c8090cc59608e48ff072186c2edbc469c6cb1");
    }); 

    it('has nothing in the map', function() {
      assert.deepEqual(tauceti.map, Array.from({length: 256}, () => 0));
    });
  });

  describe('#created system', function() {
    var polaris;
    
    before('create polaris', function(done) {
      polaris = new System('polaris');
      polaris.create().then(function() {
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('exists', function() {
      assert.equal(polaris.exists(), true);
    });

    it('is identical to itself', function() {
      var polaris2 = new System(polaris.name);
      assert.deepEqual(polaris.map, polaris2.map);
    });

    it.only('cannot be recreated', function(done) {
      polaris.create().then(function() {
        done(new Error('create() worked'));
      }).catch(function(err) {
        if(err.message === 'This system was already created!') {
          done();
        } else {
          done(err);
        };
      });
    });

    it('doesn\'t have an empty map', function() {
      var nowhere = new System('nowhere');
      // TODO: Set this to the actual map.
      assert.notDeepEqual(polaris.map, nowhere.map);
    });
  })
});

