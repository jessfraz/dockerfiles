/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports"], function (require, exports) {
    /**
     * Format of the language map is as follows:
     * 	moduleId: the module for with translations exists. '*' represents all modules.
     * 	string[]: list of available languages
     *
     * Example:
     * 	{
     * 		'*' : ['en, 'de'],
     * 		'vs/monaco/ui/workbench/web/workbench.main' : ['en', 'de', 'fr']
     * 	}
     */
    exports.languages = {};
});
