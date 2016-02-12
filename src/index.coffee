# out: ../lib/index.js
path = require "path"
webpack = require "webpack"
ip = require "ip"
fs = require "fs"
sendfile = require "koa-sendfile"
serve = require "koa-static"
chokidar = require "chokidar"
createApp = require("./createApp")
require "coffee-script/register"

fstools = require "./fstools"

rebuildApp = (options) ->
  fs.writeFileSync("#{options.workingDir}/index.js",createApp(options))

module.exports = (options) ->
  workingDir = path.resolve(options.folder)
  unless fstools.isDirectory(workingDir)
    throw new Error "#{workingDir} doesn't exist or is no directory"

  options.workingDir = workingDir
  options.libDir = path.resolve(__dirname,"../lib/")
  options.appDir = path.resolve(__dirname,"../app/")
  options.modulesDir = path.resolve(__dirname,"../node_modules/")
  options.ip = ip.address()

  exts = ["coffee","js","json"]
  for ext in exts
    filename = "#{options.workingDir}/webpack.config.#{ext}"
    if fstools.isFile(filename)
      webconf = require filename
      break
  webconf ?= require "#{options.appDir}/webpack.config"
  webconf.context = workingDir
  webconf.plugins ?= []
  webconf.plugins.push new webpack.optimize.OccurrenceOrderPlugin()
  webconf.plugins.push new webpack.HotModuleReplacementPlugin()
  webconf.plugins.push new webpack.NoErrorsPlugin()
  webconf.entry ?= {}
  webconf.entry.index = ["#{options.modulesDir}/webpack-hot-middleware/client","#{options.workingDir}/index.js"]
  webconf.output ?= {}
  webconf.output.path = "/out/"
  webconf.output.filename = "[name].js"
  compiler = webpack(webconf)

  rebuildApp(options)

  koa = require("koa")()
  koa.use serve(workingDir,index:false)
  koa.use require('webpack-koa-dev-middleware').default(compiler, publicPath:"/out/", noInfo:true)
  koa.use (next) ->
    yield require("webpack-hot-middleware")(compiler).bind(null,@req,@res)
    yield next
  koa.use ->
    yield sendfile.call(@,"#{options.appDir}/index.html")

  server = require("http").createServer(koa.callback())
  server.listen options.port, ->
    console.log "listening on http://#{options.ip}:#{options.port}/"

  chokidar.watch(options.libDir).on "all", (event, path) ->
    rebuildApp(options)

  chokidar.watch(options.workingDir,ignored:/index.js/).on "all", (event, path) ->
    rebuildApp(options)
