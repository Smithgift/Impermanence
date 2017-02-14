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

  describe('empty system', function() {
    var tauceti;

    before('create empty system', function() {
      tauceti = new System("tauceti");
    });

    it('does not exist', function() {
      assert.eventually.equal(tauceti.exists(), false);
    })

    it('has a name', function() {
      assert.equal(tauceti.name, 'tauceti');
    });

    it('has the right hash', function() {
      assert.equal(tauceti.hash, "0x69807b079150d6528543919a437c8090cc59608e48ff072186c2edbc469c6cb1");
    }); 

    it('has nothing in the map', function() {
      assert.eventually.deepEqual(tauceti.sysMap(), Array.from({length: 256}, () => 0));
    });
  });

  describe('created system', function() {
    var polaris;
    
    before('create polaris', function() {
      polaris = new System('polaris');
      return polaris.create();
    });

    it('exists', function() {
      return assert.eventually.equal(polaris.exists(), true);
    });

    it('cannot be recreated', function(done) {
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

    it('has the correct map', function() {
      return assert.eventually.isOk(
        Promise.all([
          polaris.sysMap(),
          galaxy.generateMapAsync(polaris.hash).map((bn) => (bn.toNumber()))
        ]).then((m) => {
            assert.deepEqual(m[0], m[1]);
            return true;
          })
        )
    });
  });

  describe('ships', function() {
    var sol;
    
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

});

