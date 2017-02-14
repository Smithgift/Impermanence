var TestRPC = require('ethereumjs-testrpc');
var Web3 = require('web3');
var Promise = require('bluebird');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

assert = chai.assert;

before(function(done) {
  web3 = new Web3(TestRPC.provider());
  Promise.promisifyAll(web3.eth);
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
