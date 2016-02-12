# out: ../lib/createApp.js
fs = require "fs"
path = require "path"
fstools = require "./fstools"

getStructure = (currentPath) ->
  entries = fs.readdirSync(currentPath)
  structure = {name: path.basename(currentPath),folders: [],components: []}
  for entry in entries
    entryPath = path.resolve(currentPath,entry)
    if path.extname(entry) == ".vue"
      structure.components.push name:path.basename(entry,".vue"), path: entryPath
    else if fstools.isDirectory(entryPath)
      folder = getStructure(entryPath)
      if folder.components.length > 0 or folder.folders.length > 0
        structure.folders.push folder
  return structure
getRoutes = (structure,path="") ->
  routes = ""
  for folder in structure.folders
    routes += getRoutes(folder,path+"/"+folder.name)
  for comp in structure.components
    routes += "  \"#{path}/#{comp.name}\": {component: require(\".#{path}/#{comp.name}.vue\")},\n"
    #routes += "  \"#{path}/#{comp.name}\": component: (resolve) -> require([\".#{path}/#{comp.name}.vue\"],resolve)\n"
  return routes
module.exports = (options) ->
  structure = getStructure(options.workingDir)
  routes = getRoutes(structure)
  try
    vueRouterPath = require.resolve("vue-router")
  catch
    vueRouterPath = "#{options.modulesDir}/vue-router"
  return """
  Vue = require("vue")
  Router = require("#{vueRouterPath}")
  Vue.use(Router)
  router = new Router({history:true, hashbang: false})

  routes = {
  #{routes}
  }
  app = Vue.extend({data: function() {return {availableRoutes: routes}}})
  router.map(routes)
  router.on("/", {component: require("#{options.appDir}/main.js")})
  router.afterEach(function(transition) {
    document.title = transition.to.path + " - vue-dev-server"
  })
  router.start(app,"#app")
  """
