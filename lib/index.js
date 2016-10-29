(function() {
  var createApp, fs, fstools, ip, koaHotDevWebpack, path, rebuildApp, webpack;

  path = require("path");

  webpack = require("webpack");

  ip = require("ip");

  fs = require("fs");

  koaHotDevWebpack = require("koa-hot-dev-webpack");

  createApp = require("./createApp");

  require("coffee-script/register");

  fstools = require("./fstools");

  rebuildApp = function(options) {
    return fs.writeFileSync(options.workingDir + "/index.js", createApp(options));
  };

  module.exports = function(options) {
    var base, chokidar, compiler, ext, exts, filename, i, koa, len, sendfile, server, webconf, workingDir;
    if (options == null) {
      options = {};
    }
    if (options.port == null) {
      options.port = 8080;
    }
    if (options.folder == null) {
      options.folder = "dev";
    }
    workingDir = path.resolve(options.folder);
    if (!fstools.isDirectory(workingDir)) {
      throw new Error(workingDir + " doesn't exist or is no directory");
    }
    options.workingDir = workingDir;
    options.libDir = path.resolve(__dirname, "../lib/");
    options.appDir = path.resolve(__dirname, "../app/");
    options.modulesDir = path.resolve(__dirname, "../node_modules/");
    if (options["static"]) {
      options["static"] = path.resolve(options["static"]);
    }
    options.ip = ip.address();
    exts = ["coffee", "js", "json"];
    for (i = 0, len = exts.length; i < len; i++) {
      ext = exts[i];
      filename = options.workingDir + "/webpack.config." + ext;
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
    if (webconf.entry == null) {
      webconf.entry = {};
    }
    webconf.entry.index = [options.workingDir + "/index.js"];
    if (webconf.output == null) {
      webconf.output = {};
    }
    if (options["static"]) {
      webconf.output.path = options["static"] + "/";
    } else {
      webconf.output.path = "/";
    }
    webconf.output.publicPath = "/";
    webconf.output.filename = "[name]_bundle.js";
    if (webconf.resolve == null) {
      webconf.resolve = {};
    }
    if ((base = webconf.resolve).alias == null) {
      base.alias = {};
    }
    webconf.resolve.alias.vue = 'vue/dist/vue.js';
    rebuildApp(options);
    if (options["static"]) {
      webconf.plugins.push(new webpack.NoErrorsPlugin());
      webconf.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
      webconf.plugins.push(new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      }));
      webconf.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      }));
      compiler = webpack(webconf);
      return compiler.run(function(err, stats) {
        var cp, cpr;
        if (err) {
          throw err;
        }
        console.log(stats.toString({
          colors: true
        }));
        if (!(stats.hasErrors() || stats.hasWarnings())) {
          cpr = require("cpr");
          cpr(options.workingDir, options["static"], {
            confirm: true,
            filter: function(value) {
              return value.indexOf("webpack.config") === -1 && value.indexOf("index.js") === -1;
            }
          }, function(err) {
            if (err) {
              throw err;
            }
          });
          cp = require("cp");
          return cp(options.appDir + "/index.html", options["static"] + "/index.html", function(err) {
            if (err) {
              throw err;
            }
          });
        } else {
          return console.log("please fix the warnings and errors with webpack first");
        }
      });
    } else {
      koa = require("koa")();
      sendfile = require("koa-sendfile");
      koa.use(require("koa-static")(workingDir, {
        index: false
      }));
      koa.use(koaHotDevWebpack(webconf));
      koa.use(function*(next) {
        yield sendfile(this, options.appDir + "/index.html");
        return (yield next);
      });
      chokidar = require("chokidar");
      chokidar.watch(options.libDir, {
        ignoreInitial: true
      }).on("all", function(event, path) {
        return rebuildApp(options);
      });
      chokidar.watch(options.workingDir, {
        ignoreInitial: true,
        ignored: /index.js/
      }).on("all", function(event, path) {
        return rebuildApp(options);
      });
      if (options.koa) {
        return koa;
      } else {
        server = require("http").createServer(koa.callback());
        server.listen(options.port, function() {
          return console.log("listening on http://" + options.ip + ":" + options.port + "/");
        });
        return server;
      }
    }
  };

}).call(this);
