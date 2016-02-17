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

  getRoutes = function(structure, path) {
    var comp, folder, i, j, len, len1, ref, ref1, routes;
    if (path == null) {
      path = "";
    }
    routes = "";
    ref = structure.folders;
    for (i = 0, len = ref.length; i < len; i++) {
      folder = ref[i];
      routes += getRoutes(folder, path + "/" + folder.name);
    }
    ref1 = structure.components;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      comp = ref1[j];
      routes += "  \"" + path + "/" + comp.name + "\": {component: require(\"." + path + "/" + comp.name + ".vue\")},\n";
    }
    return routes;
  };

  module.exports = function(options) {
    var error, routes, structure, vueRouterPath;
    structure = getStructure(options.workingDir);
    routes = getRoutes(structure);
    try {
      vueRouterPath = require.resolve("vue-router");
    } catch (error) {
      vueRouterPath = options.modulesDir + "/vue-router";
    }
    return "Vue = require(\"vue\")\nVue.config.debug = true\nRouter = require(\"" + vueRouterPath + "\")\nVue.use(Router)\nrouter = new Router({history:" + (!options["static"]) + ", hashbang: " + (options["static"] != null) + "})\n\nroutes = {\n" + routes + "\n}\napp = Vue.extend({data: function() {return {availableRoutes: routes}}})\nrouter.map(routes)\nrouter.on(\"/\", {component: require(\"" + options.appDir + "/main.js\")})\nrouter.afterEach(function(transition) {\n  document.title = transition.to.path + \" - vue-dev-server\"\n})\nrouter.start(app,\"#app\")";
  };

}).call(this);
