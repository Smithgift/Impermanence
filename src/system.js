// ORM of a system.
module.exports = function(web3, galaxy) {
  function System(name) {
    this.name = name;
    this.hash = '0x' + web3.sha3(this.name);
    this.refreshMap();
  }

  System.prototype.refreshMap = function() {
    this.map = galaxy.getSystemMap(this.hash).map((bn) => (bn.toNumber()));
  };

  System.prototype.exists = function() {
    return galaxy.galacticMap(this.hash)[1];
  }

  System.prototype.create = function() {
    return new Promise(function(resolve, reject) {
      var systemAdded = galaxy.systemAdded({'_systemHash': this.hash});
      galaxy.addSystem(this.name, {gas: 500000});
      systemAdded.watch(function(err, result) {
        if(err) {
          reject(err);
        } else {
          systemAdded.stopWatching();
          resolve(result);
        };
      });
    }).then((result) => {
      this.refreshMap();
      return result;
    });
  };

  return System;
}
