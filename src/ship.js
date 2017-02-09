'use strict';

module.exports = function(web3, galaxy) {

  var shipCache = {};

  // ORM of a ship struct.
  function Ship(id) {
    this.id = id;
  }

  function getShip(id) {
    if(shipCache[id]) return shipCache[id];
    shipCache[id] = new Ship(id);
    return shipCache[id];
  };

};
