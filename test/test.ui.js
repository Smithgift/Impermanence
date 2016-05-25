var chai = require('chai')
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = chai.assert;

var sinon = require('sinon');

var $ = require('jquery')

function MockSystem() {};

MockSystem.prototype.create = sinon.stub();

MockSystem.prototype.exists = function() {
  return this._exists;
};

var m = require('mithril');
var ui = require('../src/ui')(m, MockSystem);

var jsdom = require('jsdom').jsdom;
var document;

before('setup mock window', function() {
  document = jsdom("");
  m.deps(document.defaultView);
  $ = require("jquery")(document.defaultView); 
});

describe('ui', function() {

  before(function() {
    sinon.spy(console, "log");
  });

  afterEach(function() {
    console.log.reset();
  });

  after(function() {
    console.log.restore();
  })

  describe('#CreateBtn', function() {
    var testSys;
    var ctrl;

    before(function() {
      testSys = new MockSystem();
      ctrl = new ui.CreateBtn.controller({sys: testSys});
    });
    
    it('ctrl.create() works on mock empty system.', function() {
      testSys.create.returns(Promise.resolve());
      ctrl.create();
      assert.equal(testSys.create.callCount, 1, 'create');
      assert.equal(console.log.callCount, 0, 'console.log');
    });

    it.skip('ctrl.create() errors on mock created system.', function() {
      testSys.create.returns(Promise.reject());
      ctrl.create();
      assert.equal(testSys.create.callCount, 1, 'create');
      assert.equal(console.log.callCount, 1, 'console.log');
    });

    it('view correct', function() {
      var tpl = ui.CreateBtn.view(ctrl, {sys: testSys});
      assert.isString(tpl.children[0]);
      var btn = tpl.children[1];
      assert.equal(btn.tag, "button");
      assert.equal(btn.attrs.onclick, ctrl.create);
      assert.isString(btn.children[0]);
    });

    afterEach(function() {
      testSys.create.reset();
    });
  });

  describe('#SystemSelect', function() {

    var ctrl;
    var pvm;

    before(function() {
      pvm = new ui.PageViewModel();
      ctrl = new ui.SystemSelect.controller({pvm: pvm});
      sinon.spy(m, "route");
    });

    after(function() {
      m.route.restore();
    })

    it('changes system', function() {
      pvm.nextSys('mizar');
      ctrl.changeSystem();
      m.route.calledWith('/system/mizar');
    });

    it('view correct', function() {
      var tpl = ui.SystemSelect.view(ctrl, {pvm: pvm});
      assert.isString(tpl.children[0]);
      assert.equal(tpl.children[1].tag, 'input');
      assert.equal(tpl.children[2].tag, 'button');
      assert.isString(tpl.children[2].children[0])
    });

    it('is bound to pvm', function() {
      var testRoot = document.createElement('div');
      m.render(testRoot, m.component(ui.SystemSelect, {pvm: pvm}));
      var input = testRoot.getElementsByTagName('input')[0];
      input.value = 'altair';
      $(input).trigger('input');
      assert.equal(pvm.nextSys(), 'altair');
    });

  });

});
