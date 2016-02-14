var m = require("mithril");

function PageViewModel() {
  this.nextSys = m.prop("");
}

var pvm = new PageViewModel();

var SystemSelect = {
  controller: function(args) {
    return {
      changeSystem: function() {
        m.route("/system/" + pvm.nextSys());
      }
    };
  },
  view: function(ctrl, args) {
    return m("div", [
      "System name:",
      m("input", {oninput: m.withAttr("value", pvm.nextSys)}),
      m("button", {onclick: ctrl.changeSystem}, ["Go!"])
    ]);
  }
}

var SystemMap = {
  controller: function(args) {
    return {
      name: m.route.param("name")
    };
  },
  view: function(ctrl, args) {
    return m("h1", [ctrl.name]);
  }
};

var FrontPage = {
  view: function(ctrl, args) {
    return m("div", [
      m.component(SystemSelect),
      m("br"),
      "Enter a system name to begin."
    ]);
  }
};

function init() {
  m.route(document.body, "/", {
    "/": m.component(FrontPage, {pvm: pvm}),
    "/system/:name": m.component(SystemMap, {pvm: pvm})
  });
}

exports.init = init;
