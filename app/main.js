var __vueify_style__ = require("vueify-insert-css").insert("ul.dev-server-nav{list-style-type:none}.dev-server-nav>li{cursor:pointer}.dev-server-nav>li:hover{color:#008cff}")
module.exports = {
  props: ["availableRoutes"],
  compiled: function() {
    return console.log(this);
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<h4>Available routes:</h4><ul class=dev-server-nav><li v-for=\"route in availableRoutes\" v-link=route.fullPath>{{route.fullPath}}</li></ul>"
