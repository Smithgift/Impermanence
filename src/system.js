// ORM of a system.
module.exports = function(web3, galaxy) {
  function System(name) {
    this.name = name;
    this.hash = '0x' + web3.sha3(this.name);
    this.refreshMap();
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

  return System;
}
