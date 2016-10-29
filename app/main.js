var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("ul.dev-server-nav{list-style-type:none}.dev-server-nav>li{cursor:pointer}.dev-server-nav>li:hover{color:#008cff}")
;(function(){
module.exports = {
  computed: {
    availableRoutes: function() {
      return this.$parent.availableRoutes;
    }
  },
  mounted: function() {
    if (this.availableRoutes.length === 1) {
      return this.$router.push(this.availableRoutes[0]);
    }
  }
};

})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
__vue__options__.render = function(){with(this){return _h('div',{staticClass:"routes"},[_m(0),_h('ul',{staticClass:"dev-server-nav"},[_l((availableRoutes),function(route){return _h('router-link',{attrs:{"to":route.path,"tag":"li"}},[_h('a',[_s(route.path)])])})])])}}
__vue__options__.staticRenderFns = [function(){with(this){return _h('h4',["Available routes:"])}}]
