// ORM of a system.

var u = require("./universe");

function System(name) {
  this.name = name;
  this.hash = "0x" + web3.sha3(this.name);
  this.refreshMap();
}
exports.System = System;

System.prototype.refreshMap = function() {
  this.map = galaxy.getSystemMap(this.hash);
};

exports.tg = function() { console.log(u.galaxy); };
