// ORM of a system.
module.exports = function(web3, galaxy) {
  
  var ship = require('./ship')(web3, galaxy);

  function System(name) {
    this.name = name;
    this.hash = '0x' + web3.sha3(this.name);
    this.refreshMap();
    this.shipActivity = galaxy.shipActivity({'system': this.hash});
    this.ships = []; // TODO: Discover existing ships.
    this.shipActivity.watch((err, result) => {
      if(err) {
        console.log(err);
        return;
      }
      // TODO: Don't double-add ships
      this.ships.push(ship.getShip(result.args.shipID));
    })
  }

  System.prototype.refreshMap = function() {
    this.sysMap = galaxy.getSystemMap(this.hash).map((bn) => (bn.toNumber()));
  };

  System.prototype.exists = function() {
    return galaxy.galacticMap(this.hash)[1];
  };

  System.prototype.create = function() {
    return new Promise((resolve, reject) => {
      if(this.exists()) {
        reject(new Error('This system was already created!'));
      }
      var systemAdded = galaxy.systemAdded({'_systemHash': this.hash});
      systemAdded.watch(function(err, result) {
        if(err) {
          reject(err);
        } else {
          systemAdded.stopWatching();
          resolve(result);
        };
      });
      this.createTx  = galaxy.addSystem(this.name, {gas: 2500000});
    }).then((result) => {
      this.refreshMap();
      return result;
    });
  };

  System.prototype.spawnCrane = function(coords, name) {
    galaxy.spawnCrane(this.hash, coords, name, {gas: 3000000});
  }

  return System;
}
