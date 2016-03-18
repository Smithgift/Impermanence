var chai = require('chai')
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = chai.assert;

var sinon = require('sinon');

function MockSystem() {};

MockSystem.prototype.create = sinon.stub();

MockSystem.prototype.exists = function() {
  return this._exists;
};

var ui = require('../src/ui')(MockSystem);


describe.only('ui', function() {

  beforeEach(function() {
    sinon.spy(console, "log");
  });

  afterEach(function() {
    console.log.restore();
  });

  describe('CreateBtn', function() {
    var testSys;

    before(function() {
      testSys = new MockSystem();
    });
    
    describe('controller', function() {
      var ctrl;

      before(function() {
        ctrl = new ui.CreateBtn.controller({sys: testSys});
      });

      it('.create() works on mock empty system.', function() {
        testSys.create.returns(Promise.resolve());
        ctrl.create();
        assert.equal(testSys.create.callCount, 1);
        assert.equal(console.log.callCount, 0);
      });
    });

  });

});
