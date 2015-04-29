/************************************************************************************************************
 * registry.js - contains a wrapper for the REG command under Windows, which provides access to the registry
 *
 *  author:   Paul Bottin a/k/a FrEsC
 *
 */

/* imports */
var util          = require('util')
,   spawn         = require('child_process').spawn

/* set to console.log for debugging */
,   log           = function () {}

/* registry hive ids */
,   HKLM          = 'HKLM'
,   HKCU          = 'HKCU'
,   HKCR          = 'HKCR'
,   HKU           = 'HKU'
,   HKCC          = 'HKCC'
,   HIVES         = [ HKLM, HKCU, HKCR, HKU, HKCC ]

/* registry value type ids */
,   REG_SZ        = 'REG_SZ'
,   REG_MULTI_SZ  = 'REG_MULTI_SZ'
,   REG_EXPAND_SZ = 'REG_EXPAND_SZ'
,   REG_DWORD     = 'REG_DWORD'
,   REG_QWORD     = 'REG_QWORD'
,   REG_BINARY    = 'REG_BINARY'
,   REG_NONE      = 'REG_NONE'
,   REG_TYPES     = [ REG_SZ, REG_MULTI_SZ, REG_EXPAND_SZ, REG_DWORD, REG_QWORD, REG_BINARY, REG_NONE ]

/* general key pattern */
,   KEY_PATTERN   = /(\\[a-zA-Z0-9_\s]+)*/

/* key path pattern (as returned by REG-cli) */
,   PATH_PATTERN  = /^(HKEY_LOCAL_MACHINE|HKEY_CURRENT_USER|HKEY_CLASSES_ROOT|HKEY_USERS|HKEY_CURRENT_CONFIG)(.*)$/

/* registry item pattern */
,   ITEM_PATTERN  = /^([a-zA-Z0-9_\s\\-]+)\s(REG_SZ|REG_MULTI_SZ|REG_EXPAND_SZ|REG_DWORD|REG_QWORD|REG_BINARY|REG_NONE)\s+([^\s].*)$/



/**
 * a single registry value record
 */
function RegistryItem (host, hive, key, name, type, value) {

  if (!(this instanceof RegistryItem))
    return new RegistryItem(host, hive, key, name, type, value);

  /* private members */
  var _host = host    // hostname
  ,   _hive = hive    // registry hive
  ,   _key = key      // registry key
  ,   _name = name    // property name
  ,   _type = type    // property type
  ,   _value = value  // property value

  /* getters/setters */
  this.__defineGetter__('host', function () { return _host; });
  this.__defineGetter__('hive', function () { return _hive; });
  this.__defineGetter__('key', function () { return _key; });
  this.__defineGetter__('name', function () { return _name; });
  this.__defineGetter__('type', function () { return _type; });
  this.__defineGetter__('value', function () { return _value; });

  Object.freeze(this);
}

util.inherits(RegistryItem, Object);

/* lock RegistryItem class */
Object.freeze(RegistryItem);
Object.freeze(RegistryItem.prototype);



/**
 * a registry object, which provides access to a single Registry key
 */
function Registry (options) {

  if (!(this instanceof Registry))
    return new Registry(options);

  /* private members */
  var _options = options || {}
  ,   _host = '' + (_options.host || '')    // hostname
  ,   _hive = '' + (_options.hive || HKLM)  // registry hive
  ,   _key  = '' + (_options.key  || '')    // registry key

  /* getters/setters */
  this.__defineGetter__('host', function () { return _host; });
  this.__defineGetter__('hive', function () { return _hive; });
  this.__defineGetter__('key', function () { return _key; });
  this.__defineGetter__('path', function () { return (_host.length == 0 ? '' : '\\\\' + host + '\\') + _hive + _key; });
  this.__defineGetter__('parent', function () {
    var i = _key.lastIndexOf('\\')
    return new Registry({
      host: this.host,
      hive: this.hive,
      key:  (i == -1)?'':_key.substring(0, i)
    });
  });

  // validate options...
  if (HIVES.indexOf(_hive) == -1)
    throw new Error('illegal hive specified.');

  if (!KEY_PATTERN.test(_key))
    throw new Error('illegal key specified.');

  Object.freeze(this);
}

util.inherits(Registry, Object);

/**
 * registry hive key LOCAL_MACHINE
 */
Registry.HKLM = HKLM;

/**
 * registry hive key CURRENT_USER
 */
Registry.HKCU = HKCU;

/**
 * registry hive key CLASSES_ROOT
 */
Registry.HKCR = HKCR;

/**
 * registry hive key USERS
 */
Registry.HKU = HKU;

/**
 * registry hive key CURRENT_CONFIG
 */
Registry.HKCC = HKCC;

/**
 * collection of available registry hive keys
 */
Registry.HIVES = HIVES;

/**
 * registry value type STRING
 */
Registry.REG_SZ = REG_SZ;

/**
 * registry value type MULTILINE_STRING
 */
Registry.REG_MULTI_SZ = REG_MULTI_SZ;

/**
 * registry value type EXPANDABLE_STRING
 */
Registry.REG_EXPAND_SZ = REG_EXPAND_SZ;

/**
 * registry value type DOUBLE_WORD
 */
Registry.REG_DWORD = REG_DWORD;

/**
 * registry value type QUAD_WORD
 */
Registry.REG_QWORD = REG_QWORD;

/**
 * registry value type BINARY
 */
Registry.REG_BINARY = REG_BINARY;

/**
 * registry value type UNKNOWN
 */
Registry.REG_NONE = REG_NONE;

/**
 * collection of available registry value types
 */
Registry.REG_TYPES = REG_TYPES;

/**
 * retrieve all values from this registry key
 */
Registry.prototype.values = function values (cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  var args = [ 'QUERY', this.path ]
  ,   proc = spawn('REG', args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'ignore' ]
      })
  ,   buffer = ''
  ,   self = this

  proc.on('close', function (code) {

    if (code !== 0) {
      log('process exited with code ' + code);
      cb(new Error('process exited with code ' + code), null);
    } else {
      var items = []
      ,   result = []
      ,   lines = buffer.split('\n')
      ,   lineNumber = 0

      for (var line in lines) {
        lines[line] = lines[line].trim();
        if (lines[line].length > 0) {
          log(lines[line]);
          if (lineNumber != 0) {
            items.push(lines[line]);
          }
          ++lineNumber;
        }
      }

      for (var item in items) {

        var match = ITEM_PATTERN.exec(items[item])
        ,   name
        ,   type
        ,   value

        if (match) {
          name = match[1].trim();
          type = match[2].trim();
          value = match[3];
          result.push(new RegistryItem(self.host, self.hive, self.key, name, type, value));
        }
      }

      cb(null, result);

    }
  });

  proc.stdout.on('data', function (data) {
    buffer += data.toString();
  });

  return this;
};

/**
 * retrieve all subkeys from this registry key
 */
Registry.prototype.keys = function keys (cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  var args = [ 'QUERY', this.path ]
  ,   proc = spawn('REG', args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'ignore' ]
      })
  ,   buffer = ''
  ,   self = this

  proc.on('close', function (code) {
    if (code !== 0) {
      log('process exited with code ' + code);
      cb(new Error('process exited with code ' + code), null);
    }
  });

  proc.stdout.on('data', function (data) {
    buffer += data.toString();
  });

  proc.stdout.on('end', function () {

    var items = []
    ,   result = []
    ,   lines = buffer.split('\n')

    for (var line in lines) {
      lines[line] = lines[line].trim();
      if (lines[line].length > 0) {
        log(lines[line]);
        items.push(lines[line]);
      }
    }

    for (var item in items) {

      var match = PATH_PATTERN.exec(items[item])
      ,   hive
      ,   key

      if (match) {
        hive = match[1];
        key  = match[2];
        if (key && (key !== self.key)) {
          result.push(new Registry({
            host: self.host,
            hive: self.hive,
            key:  key
          }));
        }
      }
    }

    cb(null, result);

  });

  return this;
};

/**
 * retrieve a named value from this registry key
 */
Registry.prototype.get = function get (name, cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  var args = [ 'QUERY', this.path, '/v', name ]
  ,   proc = spawn('REG', args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'ignore' ]
      })
  ,   buffer = ''
  ,   self = this

  proc.on('close', function (code) {
    if (code !== 0) {
      log('process exited with code ' + code);
      cb(new Error('process exited with code ' + code), null);
    } else {
      var items = []
      ,   result = null
      ,   lines = buffer.split('\n')
      ,   lineNumber = 0

      for (var line in lines) {
        lines[line] = lines[line].trim();
        if (lines[line].length > 0) {
          log(lines[line]);
          if (lineNumber != 0) {
             items.push(lines[line]);
          }
          ++lineNumber;
        }
      }

      var item = items[0] || ''
      ,   match = ITEM_PATTERN.exec(item)
      ,   name
      ,   type
      ,   value

      if (match) {
        name = match[1].trim();
        type = match[2].trim();
        value = match[3];
        result = new RegistryItem(self.host, self.hive, self.key, name, type, value);
      }

      cb(null, result);
    }
  });

  proc.stdout.on('data', function (data) {
    buffer += data.toString();
  });

  return this;
};

/**
 * put a value into this registry key, overwrites existing value
 */
Registry.prototype.set = function set (name, type, value, cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  if (REG_TYPES.indexOf(type) == -1)
    throw Error('illegal type specified.');
  
  var args = ['ADD', this.path];
  if (name == '')
    args.push('/ve');
  else
    args = args.concat(['/v', name]);
  
  args = args.concat(['/t', type, '/d', value, '/f']);

  var proc = spawn('REG', args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'ignore' ]
      })

  proc.on('close', function (code) {
    if (code !== 0) {
      log('process exited with code ' + code);
      cb(new Error('process exited with code ' + code));
    } else {
      cb(null);
    }
  });

  proc.stdout.on('data', function (data) {
    // simply discard output
    log(''+data);
  });

  return this;
};

/**
 * remove a named value from this registry key
 */
Registry.prototype.remove = function remove (name, cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  var args = name ? ['DELETE', this.path, '/f', '/v', name] : ['DELETE', this.path, '/f', '/ve']
  ,   proc = spawn('REG', args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'ignore' ]
      })

  proc.on('close', function (code) {
    if (code !== 0) {
      log('process exited with code ' + code);
      cb(new Error('process exited with code ' + code));
    } else {
      cb(null);
    }
  });

  proc.stdout.on('data', function (data) {
    // simply discard output
    log(''+data);
  });

  return this;
};

/**
 * erase this registry key and it's contents
 */
Registry.prototype.erase = function erase (cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  var args = ['DELETE', this.path, '/f', '/va']
  ,   proc = spawn('REG', args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'ignore' ]
      })

  proc.on('close', function (code) {
    if (code !== 0) {
      log('process exited with code ' + code);
      cb(new Error('process exited with code ' + code));
    } else {
      cb(null);
    }
  });

  proc.stdout.on('data', function (data) {
    // simply discard output
    log(''+data);
  });

  return this;
};

/**
 * create this registry key
 */
Registry.prototype.create = function create (cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  var args = ['ADD', this.path]
  ,   proc = spawn('REG', args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'ignore' ]
      })

  proc.on('close', function (code) {
    if (code !== 0) {
      log('process exited with code ' + code);
      cb(new Error('process exited with code ' + code));
    } else {
      cb(null);
    }
  });

  proc.stdout.on('data', function (data) {
    // simply discard output
    log(''+data);
  });

  return this;
};

module.exports = Registry;

/* lock Registry class */
Object.freeze(Registry);
Object.freeze(Registry.prototype);
