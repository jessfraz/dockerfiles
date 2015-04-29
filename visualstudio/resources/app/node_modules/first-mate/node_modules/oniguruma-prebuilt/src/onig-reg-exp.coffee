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

module.exports =
class OnigRegExp
  constructor: (@source) ->
    @scanner = new OnigScanner([@source])

  captureIndicesForMatch: (string, match) ->
    if match?
      {captureIndices} = match
      string = @scanner.convertToString(string)
      for capture in captureIndices
        capture.match = string[capture.start...capture.end]
      captureIndices
    else
      null

  searchSync: (string, startPosition=0) ->
    match = @scanner.findNextMatchSync(string, startPosition)
    @captureIndicesForMatch(string, match)

  search: (string, startPosition=0, callback) ->
    if typeof startPosition is 'function'
      callback = startPosition
      startPosition = 0

    @scanner.findNextMatch string, startPosition, (error, match) =>
      callback?(error, @captureIndicesForMatch(string, match))

  testSync: (string) -> @searchSync(string)?

  test: (string, callback) ->
    @search string, 0, (error, result) -> callback?(error, result?)
