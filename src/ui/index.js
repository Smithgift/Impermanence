var m = require('mithril');
var common = require('../common');

module.exports = function(System) {

/*  var FrontPage = {
    view: function() {
      return m("div", [
        m(SystemSelect),
        m("br"),
        "Enter a system name to begin."
      ]);
    }
  };*/

  function init() {
    m.route(document.body, "/system/Sol", {
      //"/": FrontPage,
      "/system/:name": require('./system-view')(System)
    });
  }

  return {
    init: init
  };
}
