/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

require('./start').load({
	mainModule: module,
	mainRequire: require,
	relativeModulePath: './run-siteextension-actual'
});