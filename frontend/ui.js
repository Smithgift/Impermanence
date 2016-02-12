function PageViewModel() {
  this.nextSys = m.prop("");
} 

var FrontPage = {
  view: function(ctrl, args) {
    return m("div", [
      m("div", [
        "System name:",
        m("input", {oninput: m.withAttr("value", args.pvm.nextSys)})
      ])
    ]);
  }
}
