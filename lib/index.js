(function() {
  var createApp, fs, fstools, ip, path, rebuildApp, webpack;

  path = require("path");

  webpack = require("webpack");

  ip = require("ip");

  fs = require("fs");

  createApp = require("./createApp");

  require("coffee-script/register");

  fstools = require("./fstools");

  rebuildApp = function(options) {
    return fs.writeFileSync(options.workingDir + "/index.js", createApp(options));
  };

  module.exports = function(options) {
    var chokidar, compiler, error, ext, exts, filename, i, koa, len, sendfile, server, wdm, webconf, whmpath, workingDir;
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
    webconf.plugins.push(new webpack.NoErrorsPlugin());
    webconf.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
    if (webconf.entry == null) {
      webconf.entry = {};
    }
    try {
      whmpath = require.resolve("webpack-hot-middleware/client");
    } catch (error) {
      whmpath = options.modulesDir + "/webpack-hot-middleware/client";
    }
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
    rebuildApp(options);
    if (options["static"]) {
      webconf.entry.index = [options.workingDir + "/index.js"];
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
      webconf.entry.index = [whmpath, options.workingDir + "/index.js"];
      webconf.plugins.push(new webpack.HotModuleReplacementPlugin());
      compiler = webpack(webconf);
      wdm = require('webpack-dev-middleware')(compiler, {
        publicPath: "/",
        noInfo: true,
        stats: {
          colors: true
        }
      });
      koa = require("koa")();
      sendfile = require("koa-sendfile");
      koa.use(require("koa-static")(workingDir, {
        index: false
      }));
      koa.use(function*(next) {
        var ctx, ended;
        ctx = this;
        ended = (yield function(done) {
          return wdm(ctx.req, {
            end: function(content) {
              ctx.body = content;
              return done(null, true);
            },
            setHeader: function() {
              return ctx.set.apply(ctx, arguments);
            }
          }, function() {
            return done(null, false);
          });
        });
        if (!ended) {
          return (yield next);
        }
      });
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
      chokidar = require("chokidar");
      chokidar.watch(options.libDir, {
        ignoreInitial: true
      }).on("all", function(event, path) {
        return rebuildApp(options);
      });
      return chokidar.watch(options.workingDir, {
        ignoreInitial: true,
        ignored: /index.js/
      }).on("all", function(event, path) {
        return rebuildApp(options);
      });
    }
  };

}).call(this);
