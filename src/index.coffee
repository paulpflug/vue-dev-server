# out: ../lib/index.js
path = require "path"
webpack = require "webpack"
ip = require "ip"
fs = require "fs"

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
  options.static = path.resolve(options.static) if options.static
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
  webconf.plugins.push new webpack.NoErrorsPlugin()
  webconf.plugins.push new webpack.optimize.OccurenceOrderPlugin()
  webconf.entry ?= {}
  try
    whmpath = require.resolve("webpack-hot-middleware/client")
  catch
    whmpath = "#{options.modulesDir}/webpack-hot-middleware/client"
  webconf.output ?= {}
  if options.static
    webconf.output.path = options.static + "/"
  else
    webconf.output.path = "/"
  webconf.output.filename = "[name]_bundle.js"
  rebuildApp(options)
  if options.static
    webconf.entry.index = ["#{options.workingDir}/index.js"]
    webconf.plugins.push new webpack.DefinePlugin 'process.env': NODE_ENV: '"production"'
    webconf.plugins.push new webpack.optimize.UglifyJsPlugin compress: warnings: false
    compiler = webpack(webconf)
    compiler.run (err, stats) ->
      throw err if err
      console.log stats.toString(colors: true)
      unless stats.hasErrors() or stats.hasWarnings()
        cpr = require "cpr"
        cpr options.workingDir, options.static, {
          confirm: true
          filter: (value) ->
            return value.indexOf("webpack.config") == -1 and value.indexOf("index.js") == -1
        }, (err) -> throw err if err
        cp = require "cp"
        cp "#{options.appDir}/index.html", options.static+"/index.html", (err) ->
          throw err if err
      else
        console.log "please fix the warnings and errors with webpack first"
  else
    webconf.entry.index = [whmpath,"#{options.workingDir}/index.js"]
    webconf.plugins.push new webpack.HotModuleReplacementPlugin()
    compiler = webpack(webconf)
    wdm = require('webpack-dev-middleware')(compiler, publicPath:"/", noInfo:true,stats:colors:true)
    koa = require("koa")()
    sendfile = require "koa-sendfile"
    koa.use require("koa-static")(workingDir,index:false)
    koa.use (next) ->
      ctx = this
      ended = yield (done) ->
        wdm ctx.req, {
          end: (content) ->
            ctx.body = content
            done(null,true)
          setHeader: -> ctx.set.apply(ctx, arguments)
        }, -> done(null,false)
      yield next unless ended


    koa.use (next) ->
      yield require("webpack-hot-middleware")(compiler).bind(null,@req,@res)
      yield next
    koa.use ->
      yield sendfile.call(@,"#{options.appDir}/index.html")

    server = require("http").createServer(koa.callback())
    server.listen options.port, ->
      console.log "listening on http://#{options.ip}:#{options.port}/"

    chokidar = require "chokidar"
    chokidar.watch(options.libDir).on "all", (event, path) ->
      rebuildApp(options)

    chokidar.watch(options.workingDir,ignored:/index.js/).on "all", (event, path) ->
      rebuildApp(options)
