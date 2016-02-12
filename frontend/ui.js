function PageViewModel() {
  this.nextSys = m.prop("");
} 

var SystemSelect = {
  view: function(ctrl, args) {
       return m("div", [
        "System name:",
        m("input", {oninput: m.withAttr("value", args.pvm.nextSys)})
      ]);
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
