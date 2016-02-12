function PageViewModel() {
  this.nextSys = m.prop("");
} 

var SystemSelect = {
  controller: function(args) {
    return {
      changeSystem: function() {
        m.route("/system/" + args.pvm.nextSys());
      }
    };
  },
  view: function(ctrl, args) {
    return m("div", [
      "System name:",
      m("input", {oninput: m.withAttr("value", args.pvm.nextSys)}),
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
}

var FrontPage = {
  view: function(ctrl, args) {
    return m("div", [
      m.component(SystemSelect, {pvm: args.pvm}),
      m("br"),
      "Enter a system name to begin."
    ]);
  }
}
