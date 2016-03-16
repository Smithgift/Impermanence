var Web3 = require('web3');
web3 = new Web3();
// Change this if you have a different RPC address.
web3.setProvider(new window.web3.providers.HttpProvider('http://localhost:8555'))

var $ = require('jquery');
var ui = require('./ui');

var universe = require('../src/universe');
var u = universe(web3);

var galaxy;

var s = require('../src/system');
var System;

// Scary debug function. Only run on your private testnet!
window.dcu = function() {
  web3.eth.defaultAccount = web3.eth.accounts[0];
  u.createUniverse().then(function(_galaxy) {
    galaxy = _galaxy;
    System = s(web3, galaxy);
    ui(System).init();
  });
}
