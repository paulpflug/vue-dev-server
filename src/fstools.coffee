# out: ../lib/fstools.js
fs = require "fs"
doesExist = (path) ->
  try
    return fs.statSync(path)
  catch
    return false
isFile = (path) ->
  if stat = doesExist(path)
    return stat.isFile()
  else
    return null
isDirectory = (path) ->
  if stat = doesExist(path)
    return stat.isDirectory()
  else
    return null
module.exports =
  doesExist: doesExist
  isFile: isFile
  isDirectory: isDirectory
