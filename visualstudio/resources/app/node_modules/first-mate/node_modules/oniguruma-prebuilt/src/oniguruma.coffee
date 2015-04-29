nativeModule = ''
if process.platform is 'win32'
  nativeModule = '../native/onig_scanner.win32.node'
else if process.platform is 'darwin'
  nativeModule = '../native/onig_scanner.osx.node'
else if process.platform is 'linux'
  if process.arch is 'ia32'
    nativeModule = '../native/onig_scanner.linux_ia32.node'
  else if process.arch is 'x64'
    nativeModule = '../native/onig_scanner.linux_x64.node'
  else
    throw new Error("Unsupported architecture for onguruma in linux: #{process.arch}")
else
  throw new Error("Unsupported platform for onguruma: #{process.platform}")
  
{OnigScanner} = require nativeModule
OnigRegExp = require './onig-reg-exp'

OnigScanner::findNextMatch = (string, startPosition=0, callback) ->
  if typeof startPosition is 'function'
    callback = startPosition
    startPosition = 0

  string = @convertToString(string)
  startPosition = @convertToNumber(startPosition)

  @_findNextMatch string, startPosition, (error, match) =>
    match?.scanner = this
    callback?(error, match)

OnigScanner::findNextMatchSync = (string, startPosition=0) ->
  string = @convertToString(string)
  startPosition = @convertToNumber(startPosition)

  match = @_findNextMatchSync(string, startPosition)
  match?.scanner = this
  match

OnigScanner::convertToString = (value) ->
  if value is undefined
    'undefined'
  else if value is null
    'null'
  else
    value.toString()

OnigScanner::convertToNumber = (value) ->
  value = parseInt(value)
  value = 0 unless isFinite(value)
  value = Math.max(value, 0)
  value

exports.OnigScanner = OnigScanner
exports.OnigRegExp = OnigRegExp
