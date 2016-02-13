#!/usr/bin/env node
var program = require('commander')
  , fs = require('fs')
  , path = require('path')

program
  .version(JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version)
  .usage('[options]')
  .option('-p, --port <number>', 'port to use (default: 8080)')
  .option('-f, --folder <path>', 'root path (default: dev)')
  .option('-s, --static <path>', 'exports a static version')
  .parse(process.argv)
if (program.port == null) {program.port = 8080}
if (program.folder == null) {program.folder = "dev"}
require("./lib/index.js")(program)
