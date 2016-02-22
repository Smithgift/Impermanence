var m = require('mithril');

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

  System.prototype.create = function() {
    var created = m.deferred();
    var systemAdded = galaxy.systemAdded({'_systemHash': this.hash});
    galaxy.addSystem(this.name, {gas: 500000});
    systemAdded.watch(function(err, result) {
      if(err) {
        created.reject();
      } else {
        systemAdded.stopWatching();
        created.resolve(result);
      }
    });
    return created.promise;
  }

  return System;
}
