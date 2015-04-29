{OnigScanner} = require 'oniguruma-prebuilt'

# Wrapper class for {OnigScanner} that caches them based on the presence of any
# anchor characters that change based on the current position being scanned.
#
# See {Pattern::replaceAnchor} for more details.
module.exports =
class Scanner
  constructor: (@patterns=[]) ->
    @anchored = false
    for pattern in @patterns when pattern.anchored
      @anchored = true
      break

    @anchoredScanner = null
    @firstLineAnchoredScanner = null
    @firstLineScanner = null
    @scanner = null

  # Create a new {OnigScanner} with the given options.
  createScanner: (firstLine, position, anchorPosition) ->
    patterns = @patterns.map (pattern) ->
      pattern.getRegex(firstLine, position, anchorPosition)
    scanner = new OnigScanner(patterns)

  # Get the {OnigScanner} for the given position and options.
  getScanner: (firstLine, position, anchorPosition) ->
    unless @anchored
      @scanner ?= @createScanner(firstLine, position, anchorPosition)
      return @scanner

    if firstLine
      if position is anchorPosition
        @firstLineAnchoredScanner ?= @createScanner(firstLine, position, anchorPosition)
      else
        @firstLineScanner ?= @createScanner(firstLine, position, anchorPosition)
    else if position is anchorPosition
      @anchoredScanner ?= @createScanner(firstLine, position, anchorPosition)
    else
      @scanner ?= @createScanner(firstLine, position, anchorPosition)

  # Public: Find the next match on the line start at the given position
  #
  # line - the string being scanned.
  # firstLine - true if the first line is being scanned.
  # position - numeric position to start scanning at.
  # anchorPosition - numeric position of the last anchored match.
  #
  # Returns an Object with details about the match or null if no match found.
  findNextMatch: (line, firstLine, position, anchorPosition) ->
    scanner = @getScanner(firstLine, position, anchorPosition)
    match = scanner.findNextMatchSync(line, position)
    match?.scanner = this
    match

  # Public: Handle the given match by calling `handleMatch` on the
  # matched {Pattern}.
  #
  # match - An object returned from a previous call to `findNextMatch`.
  # stack - An array of {Rule} objects.
  # line - The string being scanned.
  # rule - The rule that matched.
  # endPatternMatch - true if the rule's end pattern matched.
  #
  # Returns an array of tokens representing the match.
  handleMatch: (match, stack, line, rule, endPatternMatch) ->
    pattern = @patterns[match.index]
    pattern.handleMatch(stack, line, match.captureIndices, rule, endPatternMatch)
