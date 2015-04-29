(function() {
  var OnigRegExp, OnigScanner, nativeModule;

  nativeModule = '';

  if (process.platform === 'win32') {
    nativeModule = '../native/onig_scanner.win32.node';
  } else if (process.platform === 'darwin') {
    nativeModule = '../native/onig_scanner.osx.node';
  } else if (process.platform === 'linux') {
    if (process.arch === 'ia32') {
      nativeModule = '../native/onig_scanner.linux_ia32.node';
    } else if (process.arch === 'x64') {
      nativeModule = '../native/onig_scanner.linux_x64.node';
    } else {
      throw new Error("Unsupported architecture for onguruma in linux: " + process.arch);
    }
  } else {
    throw new Error("Unsupported platform for onguruma: " + process.platform);
  }

  OnigScanner = require(nativeModule).OnigScanner;

  OnigRegExp = require('./onig-reg-exp');

  OnigScanner.prototype.findNextMatch = function(string, startPosition, callback) {
    if (startPosition == null) {
      startPosition = 0;
    }
    if (typeof startPosition === 'function') {
      callback = startPosition;
      startPosition = 0;
    }
    string = this.convertToString(string);
    startPosition = this.convertToNumber(startPosition);
    return this._findNextMatch(string, startPosition, (function(_this) {
      return function(error, match) {
        if (match != null) {
          match.scanner = _this;
        }
        return typeof callback === "function" ? callback(error, match) : void 0;
      };
    })(this));
  };

  OnigScanner.prototype.findNextMatchSync = function(string, startPosition) {
    var match;
    if (startPosition == null) {
      startPosition = 0;
    }
    string = this.convertToString(string);
    startPosition = this.convertToNumber(startPosition);
    match = this._findNextMatchSync(string, startPosition);
    if (match != null) {
      match.scanner = this;
    }
    return match;
  };

  OnigScanner.prototype.convertToString = function(value) {
    if (value === void 0) {
      return 'undefined';
    } else if (value === null) {
      return 'null';
    } else {
      return value.toString();
    }
  };

  OnigScanner.prototype.convertToNumber = function(value) {
    value = parseInt(value);
    if (!isFinite(value)) {
      value = 0;
    }
    value = Math.max(value, 0);
    return value;
  };

  exports.OnigScanner = OnigScanner;

  exports.OnigRegExp = OnigRegExp;

}).call(this);
