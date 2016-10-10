(function() {
  var doesExist, fs, isDirectory, isFile;

  fs = require("fs");

  doesExist = function(path) {
    try {
      return fs.statSync(path);
    } catch (error) {
      return false;
    }
  };

  isFile = function(path) {
    var stat;
    if (stat = doesExist(path)) {
      return stat.isFile();
    } else {
      return null;
    }
  };

  isDirectory = function(path) {
    var stat;
    if (stat = doesExist(path)) {
      return stat.isDirectory();
    } else {
      return null;
    }
  };

  module.exports = {
    doesExist: doesExist,
    isFile: isFile,
    isDirectory: isDirectory
  };

}).call(this);
