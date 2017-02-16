var Web3 = require('web3');
web3 = new Web3();
// Change this if you have a different RPC address.
web3.setProvider(new window.web3.providers.HttpProvider('http://localhost:8555'))

var m = require('mithril');

var ui = require('../src/ui');

var universe = require('../src/universe');
var u = universe(web3);

var galaxy;

var s = require('../src/system');
var System;

function connect(_galaxy) {
  galaxy = u.linkGalaxy(_galaxy);
  System = s(web3, galaxy);
  ui(System).init();
}


document.addEventListener('DOMContentLoaded', function(){
  web3.eth.defaultAccount = web3.eth.accounts[0];
  connect(require('../build/galaxy-address.js'));
});
