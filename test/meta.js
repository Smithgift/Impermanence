var Web3 = require('web3');

before(function() {
  web3 = new Web3();
  // Deliberately set non-default to avoid accidental misconnections.
  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8555'))
  web3.eth.defaultAccount = web3.eth.accounts[0];
})
