var Web3 = require('web3');
web3 = new Web3();
// Change this if you have a different RPC address.
web3.setProvider(new window.web3.providers.HttpProvider('http://localhost:8555'))

var $ = require('jquery');
var m = require('mithril');

var ui = require('../src/ui');

var universe = require('../src/universe');
var u = universe(web3);

var galaxy;

var s = require('../src/system');
var System;

function connect(_galaxy) {
  galaxy = _galaxy;
  System = s(web3, galaxy);
  ui(m, System).init();
}

// Scary debug function. Only run on your private testnet!
window.dcu = function() {
  web3.eth.defaultAccount = web3.eth.accounts[0];
  u.createUniverse().then(connect);
};

// 0xfffeb276f004ea8b05366ac9763beb25b5b4d946

// Scarier automatic use of debug function.
$(document).ready(() => {
  web3.eth.defaultAccount = web3.eth.accounts[0];
  connect(u.linkGalaxy('0xfffeb276f004ea8b05366ac9763beb25b5b4d946'));
});
