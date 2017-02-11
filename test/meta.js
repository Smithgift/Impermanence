var TestRPC = require('ethereumjs-testrpc');
var Web3 = require('web3');

before(function(done) {
  web3 = new Web3(TestRPC.provider());
  this.timeout(0);
  web3.eth.getAccounts((err, result) => {
    if(err) {
      done(err);
      return;
    }
    web3.eth.defaultAccount = result[0];
    done();
  });
})
