var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("ul.dev-server-nav{list-style-type:none}.dev-server-nav>li{cursor:pointer}.dev-server-nav>li:hover{color:#008cff}")
module.exports = {
  computed: {
    availableRoutes: function() {
      return this.$parent.availableRoutes;
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<h4>Available routes:</h4><ul class=dev-server-nav><li v-for=\"route in availableRoutes\" v-link=route.fullPath>{{route.fullPath}}</ul>"
