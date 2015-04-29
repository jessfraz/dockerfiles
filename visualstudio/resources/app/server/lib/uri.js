/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports"], function (require, exports) {
    var URI;
    (function (URI) {
        function isURI(thing) {
            if (!thing) {
                return false;
            }
            if (typeof thing.scheme !== 'string') {
                return false;
            }
            if (typeof thing.authority !== 'string') {
                return false;
            }
            if (typeof thing.path !== 'string') {
                return false;
            }
            if (typeof thing.query !== 'string') {
                return false;
            }
            if (typeof thing.fragment !== 'string') {
                return false;
            }
            if (typeof thing.with !== 'function') {
                return false;
            }
            if (typeof thing.withScheme !== 'function') {
                return false;
            }
            if (typeof thing.withAuthority !== 'function') {
                return false;
            }
            if (typeof thing.withPath !== 'function') {
                return false;
            }
            if (typeof thing.withQuery !== 'function') {
                return false;
            }
            if (typeof thing.withFragment !== 'function') {
                return false;
            }
            if (typeof thing.toString !== 'function') {
                return false;
            }
            if (typeof thing.toJSON !== 'function') {
                return false;
            }
            return true;
        }
        URI.isURI = isURI;
        var _regexp = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
        function parse(value) {
            var matched;
            if (value && (matched = _regexp.exec(value))) {
                return create(matched[2], matched[4], matched[5], matched[7], matched[9]);
            }
            else {
                return create();
            }
        }
        URI.parse = parse;
        function file(path) {
            return create('file', _empty, path);
        }
        URI.file = file;
        var _slash = '/', _empty = '';
        var UriImpl = (function () {
            function UriImpl(str, data) {
                this._str = str;
                this._data = data;
            }
            Object.defineProperty(UriImpl.prototype, "scheme", {
                get: function () {
                    return this._data.scheme;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(UriImpl.prototype, "authority", {
                get: function () {
                    return this._data.authority;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(UriImpl.prototype, "path", {
                get: function () {
                    return this._data.path;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(UriImpl.prototype, "query", {
                get: function () {
                    return this._data.query;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(UriImpl.prototype, "fragment", {
                get: function () {
                    return this._data.fragment;
                },
                enumerable: true,
                configurable: true
            });
            UriImpl.prototype.withScheme = function (value) {
                return create(value, this._data.authority, this._data.path, this._data.query, this._data.fragment);
            };
            UriImpl.prototype.withAuthority = function (value) {
                return create(this._data.scheme, value, this._data.path, this._data.query, this._data.fragment);
            };
            UriImpl.prototype.withPath = function (value) {
                return create(this._data.scheme, this._data.authority, value, this._data.query, this._data.fragment);
            };
            UriImpl.prototype.withQuery = function (value) {
                return create(this._data.scheme, this._data.authority, this._data.path, value, this._data.fragment);
            };
            UriImpl.prototype.withFragment = function (value) {
                return create(this._data.scheme, this._data.authority, this._data.path, this._data.query, value);
            };
            UriImpl.prototype.with = function () {
                return create.apply(undefined, arguments);
            };
            UriImpl.prototype.toString = function () {
                return this._str;
            };
            UriImpl.prototype.toJSON = function () {
                return this._str;
            };
            return UriImpl;
        })();
        function create(scheme, authority, path, query, fragment) {
            scheme = !scheme ? _empty : scheme.toLowerCase();
            // normalize and sanitize data
            var data = {
                scheme: scheme,
                authority: authority,
                path: path,
                query: query,
                fragment: fragment
            };
            (_uriNormalizer[scheme] || anyScheme)(data);
            // toString 
            var str = (_toString[scheme] || anySchemeToString)(data);
            return new UriImpl(str, data);
        }
        URI.create = create;
        // ------ scheme specific toString methods -----------------------------------------------
        var _toString = Object.create(null);
        _toString['file'] = fileSchemeToString;
        function anySchemeToString(value) {
            var parts = [];
            if (value.scheme) {
                parts.push(value.scheme);
                parts.push(':');
            }
            if (value.authority) {
                // if there is an authority we need double slashes
                parts.push('//');
                parts.push(value.authority);
            }
            if (value.path) {
                // authority and path are separated by a slash
                if (value.authority && value.path.charCodeAt(0) !== _slash.charCodeAt(0)) {
                    parts.push(_slash);
                }
                parts.push(value.path);
            }
            if (value.query) {
                parts.push('?');
                parts.push(value.query);
            }
            if (value.fragment) {
                parts.push('#');
                parts.push(value.fragment);
            }
            return parts.join(_empty);
        }
        // ------ scheme specific normalizer -----------------------------------------------
        var _uriNormalizer = Object.create(null);
        _uriNormalizer['http'] = httpScheme;
        _uriNormalizer['https'] = httpScheme;
        _uriNormalizer['file'] = fileScheme;
        function anyScheme(data) {
            data.scheme = data.scheme || _empty;
            data.authority = data.authority || _empty;
            data.path = data.path || _empty;
            data.query = data.query || _empty;
            data.fragment = data.fragment || _empty;
        }
        function httpScheme(data) {
            data.scheme = data.scheme ? data.scheme.toLowerCase() : _empty; // scheme is case insensitive
            data.authority = data.authority ? data.authority.toLowerCase() : _empty; // authority is case insensitive
            data.path = data.path || _empty;
            data.query = data.query || _empty;
            data.fragment = data.fragment || _empty;
        }
        // ---- file scheme specific toString and normalizer -----------------------------
        var _absDriveLetterRegExp = /^(\\|\/)?([A-Za-z])(:.*)$/;
        var _driveLetterRegExp = /^([A-Za-z])(:.*)$/;
        function fileSchemeToString(value) {
            var parts = [];
            // ignore scheme and authority for file uris
            parts.push('file://');
            if (value.path) {
                // normalize: windows drive letter paths are absoluet
                // and must start with a slash
                if (_driveLetterRegExp.test(value.path)) {
                    parts.push(_slash);
                }
                parts.push(value.path);
            }
            if (value.query) {
                parts.push('?');
                parts.push(value.query);
            }
            if (value.fragment) {
                parts.push('#');
                parts.push(value.fragment);
            }
            return parts.join(_empty);
        }
        function fileScheme(data) {
            data.authority = _empty;
            if (data.path) {
                // normalize: (a) on windows drive letter window
                // paths don't have to start with a slash or backslash
                // (b) make sure to use slashes only
                var parts = [], match;
                if (match = _absDriveLetterRegExp.exec(data.path)) {
                    // normalize (lower-case) drive letter
                    parts.push(match[2].toLowerCase());
                    parts.push(match[3]);
                }
                else {
                    // absolute or relative path
                    parts.push(data.path);
                }
                // normalize to fwd slashes
                data.path = parts.join(_empty).replace(/\\/g, _slash);
            }
            else {
                data.path = _empty;
            }
            data.query = data.query || _empty;
            data.fragment = data.fragment || _empty;
        }
    })(URI || (URI = {}));
    return URI;
});
