var Web3 = require('web3');
window.web3 = new Web3();
// Change this if you have a different RPC address.
window.web3.setProvider(new window.web3.providers.HttpProvider('http://localhost:8545'))
//window.build = require('./abi');

var $ = require("jquery");
var ui = require("./ui");
$(document).ready(function() {ui.init();});

window.cu = require("./universe").cu;

window.tg = require("./system").tg;
