(function() {
  var fs, fstools, getRoutes, getStructure, path;

  fs = require("fs");

  path = require("path");

  fstools = require("./fstools");

  getStructure = function(currentPath) {
    var entries, entry, entryPath, folder, i, len, structure;
    entries = fs.readdirSync(currentPath);
    structure = {
      name: path.basename(currentPath),
      folders: [],
      components: []
    };
    for (i = 0, len = entries.length; i < len; i++) {
      entry = entries[i];
      entryPath = path.resolve(currentPath, entry);
      if (path.extname(entry) === ".vue") {
        structure.components.push({
          name: path.basename(entry, ".vue"),
          path: entryPath
        });
      } else if (fstools.isDirectory(entryPath)) {
        folder = getStructure(entryPath);
        if (folder.components.length > 0 || folder.folders.length > 0) {
          structure.folders.push(folder);
        }
      }
    }
    return structure;
  };

  getRoutes = function(structure, rootpath) {
    var comp, folder, i, j, len, len1, ref, ref1, routeName, routePath, routes;
    if (rootpath == null) {
      rootpath = "";
    }
    routes = "";
    ref = structure.folders;
    for (i = 0, len = ref.length; i < len; i++) {
      folder = ref[i];
      routes += getRoutes(folder, rootpath + "/" + folder.name);
    }
    ref1 = structure.components;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      comp = ref1[j];
      routeName = rootpath.replace(path.sep, "/") + "/" + comp.name;
      routePath = "." + rootpath + path.sep + comp.name + ".vue";
      routePath = routePath.replace(/\\/g, "\\\\");
      routes += "  {path: \"" + routeName + "\", component: require(\"" + routePath + "\")},\n";
    }
    return routes;
  };

  module.exports = function(options) {
    var mainPath, routes, structure, vueRouterPath;
    structure = getStructure(options.workingDir);
    routes = getRoutes(structure);
    try {
      vueRouterPath = require.resolve("vue-router");
    } catch (error) {
      vueRouterPath = "" + options.modulesDir + path.sep + "vue-router";
    }
    mainPath = options.appDir + path.sep + "main.js";
    vueRouterPath = vueRouterPath.replace(/\\/g, "\\\\");
    mainPath = mainPath.replace(/\\/g, "\\\\");
    return "Vue = require(\"vue\")\nVue.config.debug = true\nRouter = require(\"" + vueRouterPath + "\")\nVue.use(Router)\nroutes = [\n" + routes + "\n]\nrouter = new Router({routes:[\n" + routes + "\n  {path:\"/\",component: require(\"" + mainPath + "\")}\n]})\nrouter.afterEach(function(to) {\n  document.title = to.path + \" - vue-dev-server\"\n})\napp = new Vue({\n  data: function() {return {availableRoutes: routes}},\n  template: \"<router-view></router-view>\",\n  router: router\n  }).$mount(\"#app\")";
  };

}).call(this);
