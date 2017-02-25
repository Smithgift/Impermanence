var m = require('mithril');
var common = require('../common');

module.exports = function(System) {

  var vm = {
    nextSys: "",
    sys: null,
    setNextSys: function(sys) {
      vm.nextSys = sys;
    },
    changeSystem: function() {
      m.route.set("/system/:name", {name: this.nextSys});
    },
    refresh: function() {
      vm.sys.refreshCache().finally(m.redraw);
    },
    create: function() {
      vm.sys.create()
        .then(vm.refresh)
    }
  }

  var SystemSelect = {
    view: function() {
      return m("div", [
        "System name:",
        m("input", {oninput: m.withAttr("value", vm.setNextSys), value: vm.nextSys}),
        m("button", {onclick: vm.changeSystem}, "Go!")
      ]);
    }
  }

  var CreateBtn = {
    view: function(vnode) {
      return m("div", [
        "No system by this name exists.",
        m("button", {onclick: () => vm.create()}, "Create it!")
      ]);
    }
  }

  var SystemMap = {
    view: function() {
      return m("table", [
        Array.from({length: 16}, (v, i) => (m("tr",
          vm.sys.cache.sysMap.slice(i * 16, (i * 16) + 15).map((tile) => m("td", common.mapLegend[tile][0]))
        )))
      ]);
    }
  }

  var SystemView = {
    oninit: function(vnode) {
      vm.sys = new System(vnode.attrs.name);
      vm.exists = null;
      vm.refresh();
    },
    view: function(vnode) {
      return m("div", [
        m(SystemSelect),
        m("h1", [vm.sys.name]),
        vm.sys.cache.exists == false ? m(CreateBtn) : "",
        vm.sys.cache.sysMap != null ? m(SystemMap) : ""
      ]);
    }
  };

  return SystemView;

};
