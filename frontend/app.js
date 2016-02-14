var Web3 = require('web3');
window.web3 = new Web3();
// Change this if you have a different RPC address.
window.web3.setProvider(new window.web3.providers.HttpProvider('http://localhost:8545'))
//window.build = require('./abi');

var $ = require("jquery");
var ui = require("./ui");
$(document).ready(function() {ui.init();});

u = require("./universe");

// Scary debug function. Only run on your private testnet!
window.dcu = function() {
  web3.eth.defaultAccount = web3.eth.accounts[0];
  u.cu();
}
window.tg = require("./system").tg;
