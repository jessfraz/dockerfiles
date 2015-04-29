(function() {
  var AndMatcher, CompositeMatcher, NegateMatcher, OrMatcher, PathMatcher, ScopeMatcher, SegmentMatcher, TrueMatcher;

  SegmentMatcher = (function() {
    function SegmentMatcher(segments) {
      this.segment = segments[0].join('') + segments[1].join('');
    }

    SegmentMatcher.prototype.matches = function(scope) {
      return scope === this.segment;
    };

    SegmentMatcher.prototype.toCssSelector = function() {
      return this.segment.split('.').map(function(dotFragment) {
        return '.' + dotFragment.replace(/\+/g, '\\+');
      }).join('');
    };

    return SegmentMatcher;

  })();

  TrueMatcher = (function() {
    function TrueMatcher() {}

    TrueMatcher.prototype.matches = function() {
      return true;
    };

    TrueMatcher.prototype.toCssSelector = function() {
      return '*';
    };

    return TrueMatcher;

  })();

  ScopeMatcher = (function() {
    function ScopeMatcher(first, others) {
      var segment, _i, _len;
      this.segments = [first];
      for (_i = 0, _len = others.length; _i < _len; _i++) {
        segment = others[_i];
        this.segments.push(segment[1]);
      }
    }

    ScopeMatcher.prototype.matches = function(scope) {
      var index, scopeSegments, segment, _i, _len, _ref;
      scopeSegments = scope.split('.');
      if (scopeSegments.length < this.segments.length) {
        return false;
      }
      _ref = this.segments;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        segment = _ref[index];
        if (!segment.matches(scopeSegments[index])) {
          return false;
        }
      }
      return true;
    };

    ScopeMatcher.prototype.toCssSelector = function() {
      return this.segments.map(function(matcher) {
        return matcher.toCssSelector();
      }).join('');
    };

    return ScopeMatcher;

  })();

  PathMatcher = (function() {
    function PathMatcher(first, others) {
      var matcher, _i, _len;
      this.matchers = [first];
      for (_i = 0, _len = others.length; _i < _len; _i++) {
        matcher = others[_i];
        this.matchers.push(matcher[1]);
      }
    }

    PathMatcher.prototype.matches = function(scopes) {
      var index, matcher, scope, _i, _len;
      index = 0;
      matcher = this.matchers[index];
      for (_i = 0, _len = scopes.length; _i < _len; _i++) {
        scope = scopes[_i];
        if (matcher.matches(scope)) {
          matcher = this.matchers[++index];
        }
        if (matcher == null) {
          return true;
        }
      }
      return false;
    };

    PathMatcher.prototype.toCssSelector = function() {
      return this.matchers.map(function(matcher) {
        return matcher.toCssSelector();
      }).join(' ');
    };

    return PathMatcher;

  })();

  OrMatcher = (function() {
    function OrMatcher(left, right) {
      this.left = left;
      this.right = right;
    }

    OrMatcher.prototype.matches = function(scopes) {
      return this.left.matches(scopes) || this.right.matches(scopes);
    };

    OrMatcher.prototype.toCssSelector = function() {
      return "" + (this.left.toCssSelector()) + ", " + (this.right.toCssSelector());
    };

    return OrMatcher;

  })();

  AndMatcher = (function() {
    function AndMatcher(left, right) {
      this.left = left;
      this.right = right;
    }

    AndMatcher.prototype.matches = function(scopes) {
      return this.left.matches(scopes) && this.right.matches(scopes);
    };

    AndMatcher.prototype.toCssSelector = function() {
      if (this.right instanceof NegateMatcher) {
        return "" + (this.left.toCssSelector()) + (this.right.toCssSelector());
      } else {
        return "" + (this.left.toCssSelector()) + " " + (this.right.toCssSelector());
      }
    };

    return AndMatcher;

  })();

  NegateMatcher = (function() {
    function NegateMatcher(matcher) {
      this.matcher = matcher;
    }

    NegateMatcher.prototype.matches = function(scopes) {
      return !this.matcher.matches(scopes);
    };

    NegateMatcher.prototype.toCssSelector = function() {
      return ":not(" + (this.matcher.toCssSelector()) + ")";
    };

    return NegateMatcher;

  })();

  CompositeMatcher = (function() {
    function CompositeMatcher(left, operator, right) {
      switch (operator) {
        case '|':
          this.matcher = new OrMatcher(left, right);
          break;
        case '&':
          this.matcher = new AndMatcher(left, right);
          break;
        case '-':
          this.matcher = new AndMatcher(left, new NegateMatcher(right));
      }
    }

    CompositeMatcher.prototype.matches = function(scopes) {
      return this.matcher.matches(scopes);
    };

    CompositeMatcher.prototype.toCssSelector = function() {
      return this.matcher.toCssSelector();
    };

    return CompositeMatcher;

  })();

  module.exports = {
    AndMatcher: AndMatcher,
    CompositeMatcher: CompositeMatcher,
    NegateMatcher: NegateMatcher,
    OrMatcher: OrMatcher,
    PathMatcher: PathMatcher,
    ScopeMatcher: ScopeMatcher,
    SegmentMatcher: SegmentMatcher,
    TrueMatcher: TrueMatcher
  };

}).call(this);
