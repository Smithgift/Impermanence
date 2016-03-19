module.exports = function(m, System) {
  
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
  
  var CreateBtn = {
    controller: function(args) {
      return {
        create: function() {
          args.sys.create()
            .then(() => {m.redraw();})
            .catch((err) => {console.log(err);}); //TODO: Better handling.
        }
      };
    },
    view: function(ctrl, args) {
      return m("div", [
        "No system by this name exists.",
        m("button", {onclick: ctrl.create}, "Create it!")
      ])
    }
  }
  
  var SystemComponent = {
    controller: function(args) {
      var name = m.route.param("name");
      var sys = new System(name);
      return {
        name: name,
        sys: sys
      };
    },
    view: function(ctrl, args) {
      return m("div", [
        m("h1", [ctrl.name]),
        ctrl.sys.exists() ? 
          "System exists." : m.component(CreateBtn, {sys: ctrl.sys})
      ]);
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
      "/system/:name": m.component(SystemComponent, {pvm: pvm})
    });
  }

  return {
    SystemSelect: SystemSelect,
    CreateBtn: CreateBtn,
    init: init
  };
}
