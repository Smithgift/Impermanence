// ORM of a system.
module.exports = function(web3, galaxy) {
  function System(name) {
    this.name = name;
    this.hash = "0x" + web3.sha3(this.name);
    this.refreshMap();
  }

  System.prototype.refreshMap = function() {
    this.map = galaxy.getSystemMap(this.hash).map((bn) => (bn.toNumber()));
  };

  return System;
}
