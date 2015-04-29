#!/usr/bin/env coffee

# This script is just a simple runner to test that the library does not crash
# when creating lots of scanners and searching lots of random strings.

async = require 'async'
crypto = require 'crypto'
{OnigScanner} = require '../src/oniguruma'

randomString = ->
  string = ''
  for i in [1..10]
    string += crypto.createHash('sha1').update(Math.random().toString(), 'utf8').digest('hex')
  string

matches = 0
startTime = Date.now()

for i in [1..100]
  scanner = new OnigScanner(["a", "b", "cd", "de"])
  for j in [1..10]
    string = randomString()
    index = 0
    while match = scanner.findNextMatchSync(string, index)
      index++
      matches++

console.log("Found #{matches} matches synchronously in #{Date.now() - startTime}ms")

matches = 0
startTime = Date.now()

queue = async.queue ({scanner, string, index}, callback) ->
  scanner.findNextMatch string, index, (error, match) ->
    if match?
      matches++
      index++
      queue.push({scanner, string, index})
    callback(error)
queue.concurrency = Infinity
queue.drain = ->
  console.log("Found #{matches} matches asynchronosly in #{Date.now() - startTime}ms")

for i in [1..100]
  scanner = new OnigScanner(["a", "b", "cd", "de"])
  queue.push({scanner, string: randomString(), index: 0}) for j in [1..10]
