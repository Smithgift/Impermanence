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
    ])
  }
}

var pvm = new PageViewModel();

$(document).ready(function() {
  m.mount(document.body, m.component(FrontPage, {pvm: pvm}));
})
