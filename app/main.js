var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("ul.dev-server-nav {\n  list-style-type: none;\n}\n.dev-server-nav > li {\n  cursor: pointer;\n}\n.dev-server-nav > li:hover {\n  color: #008cff;\n}")
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
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function(){with(this){return _h('div',{staticClass:"routes"},[_m(0),_h('ul',{staticClass:"dev-server-nav"},[_l((availableRoutes),function(route){return _h('router-link',{attrs:{"to":route.path,"tag":"li"}},[_h('a',[_s(route.path)])])})])])}}
__vue__options__.staticRenderFns = [function(){with(this){return _h('h4',["Available routes:"])}}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1", __vue__options__)
  } else {
    hotAPI.reload("data-v-1", __vue__options__)
  }
})()}