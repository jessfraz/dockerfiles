/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function (require, exports) {
    // TODO: remove this
    function checkFunction(object, name, length) {
        return typeof object[name] === 'function' && object[name].length === 0;
    }
    /**
     * Check iff the provided object matches the shape of the
     * UUID interface.
     */
    function isUUID(thing) {
        return thing instanceof ValueUUID || thing instanceof V4UUID || (checkFunction(thing, 'asHex', 0) && checkFunction(thing, 'equals', 1));
    }
    exports.isUUID = isUUID;
    var ValueUUID = (function () {
        function ValueUUID(_value) {
            this._value = _value;
            // empty
        }
        ValueUUID.prototype.asHex = function () {
            return this._value;
        };
        ValueUUID.prototype.equals = function (other) {
            return this.asHex() === other.asHex();
        };
        return ValueUUID;
    })();
    var V4UUID = (function (_super) {
        __extends(V4UUID, _super);
        function V4UUID() {
            _super.call(this, [
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                '-',
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                '-',
                '4',
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                '-',
                V4UUID._oneOf(V4UUID._timeHighBits),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                '-',
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
                V4UUID._randomHex(),
            ].join(''));
        }
        V4UUID._oneOf = function (array) {
            var idx = Math.floor(array.length * Math.random());
            return array[idx];
        };
        V4UUID._randomHex = function () {
            return V4UUID._oneOf(V4UUID._chars);
        };
        V4UUID._chars = ['0', '1', '2', '3', '4', '5', '6', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
        V4UUID._timeHighBits = ['8', '9', 'a', 'b'];
        return V4UUID;
    })(ValueUUID);
    /**
     * An empty UUID that contains only zeros.
     */
    exports.empty = new ValueUUID('00000000-0000-0000-0000-000000000000');
    function v4() {
        return new V4UUID();
    }
    exports.v4 = v4;
    var _UUIDPattern = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;
    /**
     * Parses a UUID that is of the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.
     * @param value A uuid string.
     */
    function parse(value) {
        if (!_UUIDPattern.test(value)) {
            throw new Error('invalid uuid');
        }
        return new ValueUUID(value);
    }
    exports.parse = parse;
    function generateUuid() {
        return v4().asHex();
    }
    exports.generateUuid = generateUuid;
});
