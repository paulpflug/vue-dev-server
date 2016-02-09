(function() {
  var chokidar, createApp, fs, fstools, ip, path, rebuildApp, sendfile, serve, webpack;

  path = require("path");

  webpack = require("webpack");

  ip = require("ip");

  fs = require("fs");

  sendfile = require("koa-sendfile");

  serve = require("koa-static");

  chokidar = require("chokidar");

  createApp = require("./createApp");

  require("coffee-script/register");

  fstools = require("./fstools");

  rebuildApp = function(options) {
    return fs.writeFileSync(options.workingDir + "/index.coffee", createApp(options));
  };

  module.exports = function(options) {
    var compiler, ext, exts, filename, i, koa, len, server, webconf, workingDir;
    workingDir = path.resolve(options.folder);
    if (!fstools.isDirectory(workingDir)) {
      throw new Error(workingDir + " doesn't exist or is no directory");
    }
    options.workingDir = workingDir;
    options.libDir = path.resolve(__dirname, "../lib/");
    options.appDir = path.resolve(__dirname, "../app/");
    options.modulesDir = path.resolve(__dirname, "../node_modules/");
    options.ip = ip.address();
    exts = ["coffee", "js", "json"];
    for (i = 0, len = exts.length; i < len; i++) {
      ext = exts[i];
      filename = workingDir + ("webpack.config." + ext);
      if (fstools.isFile(filename)) {
        webconf = require(filename);
        break;
      }
    }
    if (webconf == null) {
      webconf = require(options.appDir + "/webpack.config");
    }
    webconf.context = workingDir;
    if (webconf.plugins == null) {
      webconf.plugins = [];
    }
    webconf.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
    webconf.plugins.push(new webpack.HotModuleReplacementPlugin());
    webconf.plugins.push(new webpack.NoErrorsPlugin());
    if (webconf.entry == null) {
      webconf.entry = {};
    }
    webconf.entry.index = [options.modulesDir + "/webpack-hot-middleware/client", options.workingDir + "/index.coffee"];
    if (webconf.output == null) {
      webconf.output = {};
    }
    webconf.output.path = "/";
    webconf.output.filename = "[name].js";
    compiler = webpack(webconf);
    rebuildApp(options);
    koa = require("koa")();
    koa.use(serve(workingDir, {
      index: false
    }));
    koa.use(require('webpack-koa-dev-middleware')["default"](compiler, {
      publicPath: "/",
      quiet: true
    }));
    koa.use(function*(next) {
      (yield require("webpack-hot-middleware")(compiler).bind(null, this.req, this.res));
      return (yield next);
    });
    koa.use(function*() {
      return (yield sendfile.call(this, options.appDir + "/index.html"));
    });
    server = require("http").createServer(koa.callback());
    server.listen(options.port, function() {
      return console.log("listening on http://" + options.ip + ":" + options.port + "/");
    });
    chokidar.watch(options.libDir).on("all", function(event, path) {
      return rebuildApp(options);
    });
    return chokidar.watch(options.workingDir, {
      ignored: /index.coffee/
    }).on("all", function(event, path) {
      return rebuildApp(options);
    });
  };

}).call(this);
