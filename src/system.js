var Promise = require('bluebird');

// ORM of a system.
module.exports = function(web3, galaxy) {
  
  var ship = require('./ship')(web3, galaxy);

  function System(name) {
    this.name = name;
    this.hash = '0x' + web3.sha3(this.name);
    this.shipActivity = galaxy.shipActivity({'system': this.hash});
    this.ships = []; // TODO: Discover existing ships.
    /*this.shipActivity.watch((err, result) => {
      if(err) {
        console.log(err);
        return;
      }
      // TODO: Don't double-add ships
      this.ships.push(ship.getShip(result.args.shipID));
    })*/
    this.cache = {
      exists: null,
      sysMap: null
    };
  }

  System.prototype.exists = function() {
    return galaxy.galacticMapAsync(this.hash)
      .then((sys) => this.cache.exists = sys[1]);
  };

  System.prototype.sysMap = function() {
    return galaxy.getSystemMapAsync(this.hash)
      .then((_sysMap) => _sysMap.map((bn) => (bn.toNumber())))
      .then((sysMap) => this.cache.sysMap = sysMap);
  };

  System.prototype.refreshCache = function() {
    return Promise.all([this.exists(), this.sysMap()]);
  };

  System.prototype.create = function() {
    return this.exists()
      .then((e) => {
        if(e) throw new Error('This system was already created!')
      }).then(new Promise((resolve, reject) => {
        var systemAdded = galaxy.systemAdded({'_systemHash': this.hash});
        systemAdded.watch(function(err, result) {
          if(err) {
            reject(err);
          } else {
            resolve(result);
          }
          systemAdded.stopWatching();
        });
        this.createTx = galaxy.addSystemAsync(this.name, {gas: 2500000})
          .catch((err) => reject(err));
      }));
  };

  System.prototype.spawnCrane = function(coords, name) {
    galaxy.spawnCrane(this.hash, coords, name, {gas: 3000000});
  }

  return System;
}
