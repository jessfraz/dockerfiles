#!/usr/bin/env coffee

fs = require 'fs'
path = require 'path'
{OnigScanner} = require '../src/oniguruma'

runBenchmarkSync = (lines, scanner) ->
  startTime = Date.now()
  matches = 0

  for line in lines
    for position in [0..line.length]
      matches++ if scanner.findNextMatchSync(line, position)

  console.log "sync:  #{matches} matches in #{Date.now() - startTime}ms"

runBenchmarkAsync =  (lines, scanner) ->
  matches = 0
  callsInProgress = 0

  callback = (error, match) ->
    matches++ if match?
    if --callsInProgress is 0
      console.log "async: #{matches} matches in #{Date.now() - startTime}ms"

  startTime = Date.now()
  for line in lines
    for position in [0..line.length]
      callsInProgress++
      scanner.findNextMatch(line, position, callback)

console.log 'oneline.js'
runBenchmarkSync(fs.readFileSync(path.join(__dirname, 'oneline.js'), 'utf8').split('\n'),
                 new OnigScanner(['\\[', '\\]', '\\{', '\\}']))
console.log 'large.js'
runBenchmarkSync(fs.readFileSync(path.join(__dirname, 'large.js'), 'utf8').split('\n'),
                 new OnigScanner(['this', 'var', 'selector', 'window']))
runBenchmarkAsync(fs.readFileSync(path.join(__dirname, 'large.js'), 'utf8').split('\n'),
                  new OnigScanner(['this', 'var', 'selector', 'window']))
