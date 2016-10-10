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
getRoutes = (structure,rootpath="") ->
  routes = ""
  for folder in structure.folders
    routes += getRoutes(folder,rootpath+"/"+folder.name)
  for comp in structure.components
    routeName = rootpath.replace(path.sep,"/")+"/"+comp.name
    routePath = "."+rootpath+path.sep+comp.name+".vue"
    routePath = routePath.replace(/\\/g,"\\\\")
    routes += "  {path: \"#{routeName}\", component: require(\"#{routePath}\")},\n"
    #routes += "  \"#{rootpath}/#{comp.name}\": component: (resolve) -> require([\".#{rootpath}/#{comp.name}.vue\"],resolve)\n"
  return routes
module.exports = (options) ->
  structure = getStructure(options.workingDir)
  routes = getRoutes(structure)
  try
    vueRouterPath = require.resolve("vue-router")
  catch
    vueRouterPath = "#{options.modulesDir}#{path.sep}vue-router"
  mainPath = options.appDir+path.sep+"main.js"
  vueRouterPath = vueRouterPath.replace(/\\/g,"\\\\")
  mainPath = mainPath.replace(/\\/g,"\\\\")
  return """
  Vue = require("vue")
  Vue.config.debug = true
  Router = require("#{vueRouterPath}")
  Vue.use(Router)
  routes = [
  #{routes}
  ]
  router = new Router({routes:[
  #{routes}
    {path:"/",component: require("#{mainPath}")}
  ]})
  router.afterEach(function(to) {
    document.title = to.path + " - vue-dev-server"
  })
  app = new Vue({
    data: function() {return {availableRoutes: routes}},
    template: "<router-view></router-view>",
    router: router
    }).$mount("#app")
  """
