/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/* JSHTM - simple templating engine

Example:
    
    <ul>
    {% people.forEach(function(person) { %}
        <li>{{ person.name }}</li>
    {% }); %}
    </ul>
*/
'use strict';
define(["require", "exports"], function (require, exports) {
    var clean = function (exp) {
        exp = /^ *$/.test(exp) ? '""' : exp;
        exp = exp.replace(/\\\\/g, '\\');
        exp = exp.replace(/\\"/g, '"');
        exp = exp.replace(/\\n"\);$/gm, '');
        exp = exp.replace(/^print\("/gm, '');
        return exp;
    };
    var wrapper = function (prefix, suffix, filter) {
        return function (match, code) {
            return prefix + (filter ? filter(code) : code) + suffix;
        };
    };
    function render(template, env) {
        if (env === void 0) { env = {}; }
        template = template.replace(/\\/g, '\\\\');
        template = template.replace(/"/g, '\\"');
        template = template.replace(/\r\n/g, '\n');
        template = template.replace(/^(.*)$/gm, wrapper('print("', '\\n");'));
        template = template.replace(/\{\{([\s\S]*?)\}\}/gm, wrapper('"); print(', '); print("', clean));
        template = template.replace(/\{%([\s\S]*?)%\}/gm, wrapper('"); ', '; print("', clean));
        template = template.replace(/\\n"\);$/, '\");');
        template = 'var _r = \"\";\nfunction print(s) { _r += s; };\n' + template + 'return _r;';
        try {
            var properties = Object.keys(env);
            var values = properties.map(function (prop) {
                return env[prop];
            });
            var functionArgs = properties;
            functionArgs.push(template);
            return Function.apply(null, functionArgs).apply(null, values);
        }
        catch (err) {
            err.sourceCode = template;
            throw err;
        }
    }
    exports.render = render;
});
