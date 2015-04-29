///*---------------------------------------------------------
// * Copyright (C) Microsoft Corporation. All rights reserved.
// *--------------------------------------------------------*/
//
///// <reference path='../../../declare/mocha.d.ts' />
///// <reference path='../../../declare/node.d.ts' />
//
//'use strict';
//
//import fs = require('fs');
//import path = require('path');
//import assert = require('assert');
//
//import workspace = require('../../../model/workspace');
//import filesContribution = require('../files.contribution');
//import files = require('../files');
//import extpath = require('../../../lib/extpath');
//import strings = require('../../../lib/strings');
//import libwatcher = require('../../../lib/watcher/watcher');
//
//suite('File watcher');
//
//function getTestWorkspace(): workspace.Workspace {
//	var data = {
//		id: 'foo',
//		path: path.join(__dirname, '..'),
//		name: 'BarFoo'
//	};
//
//	return new workspace.Workspace(data);
//}
//
//test('FileWatcher events', function(done) {
//	var testWorkspace = getTestWorkspace();
//	var counter = 0;
//	var isDone = false;
//	
//	var wwwRoot = path.dirname(path.dirname(path.dirname(__dirname)));
//	if (extpath.isUNCPath(wwwRoot)) {
//		wwwRoot = process.cwd();
//		if (strings.endsWith(wwwRoot, 'tests')) {
//			wwwRoot = path.dirname(wwwRoot);
//		} else if (!strings.endsWith(wwwRoot, 'server')) {
//			wwwRoot = path.join(process.cwd(), 'server');
//		}
//	}
//	
//	var filePath = path.join(__dirname, 'data', 'some.txt');
//	
//	var service = new filesContribution.Win32FileService(<any>{
//		eventbus: {
//			emit: function(type:string, event:any) {
//				var changes = getFileChanges(event);
//				
//				assert.ok(changes.length > 0);
//				
//				if (counter === 0) {
//					assert.ok(changes.some((change)=>strings.endsWith(change.path, '/data/some.txt') && change.type === 1));
//				} else if (counter === 1) {
//					assert.ok(changes.some((change)=>strings.endsWith(change.path, '/data/some.txt') && change.type === 0));
//				} else	if (counter === 2) {
//					if (!isDone) {
//						assert.ok(changes.some((change)=>strings.endsWith(change.path, '/data/some.txt') && change.type === 2));
//						isDone = true;
//						done();
//					}
//				}
//			}
//		},
//		options: {
//			wwwRoot: wwwRoot,
//			workspacesRoot: path.join(__dirname, '..')
//		},
//		logger: {
//			info: function() {}
//		}
//	});
//	
//	fs.writeFileSync(filePath, 'Test');
//	
//	setTimeout(()=>{
//		counter++;
//		fs.writeFileSync(filePath, 'More');
//		
//		setTimeout(()=>{
//			counter++;
//			fs.unlinkSync(filePath);
//		}, 100);
//	}, 100);
//});
//
//
//interface IFileChange {
//	path:string;
//	type:libwatcher.ChangeTypes;
//}
//
//function getFileChanges(events:libwatcher.IFileEvent[]) {
//	
//	// Compute changes
//	var changes:IFileChange[] = [];
//	for (var i = 0, len = events.length; i < len; i++) {
//		changes = changes.concat(toFileChanges(events[i]));
//	}
//	
//	return changes;
//}
//
//function toFileChanges(event:libwatcher.IFileEvent) {
//	var children = event.deltaTree.children;
//	if (!children) {
//		return;	
//	}
//	
//	var changes:IFileChange[] = [];
//	for (var i = 0, len = children.length; i < len; i++) {
//		computePaths(children[i], changes);	
//	}
//	
//	return changes;
//}
//
//function computePaths(delta:libwatcher.IFileDelta, out:IFileChange[]) {
//	if (!(delta.pathArray.length === 2 && delta.pathArray[1] === 'index.lock')) {
//		if (delta.pathArray.length > 0 && delta.pathArray[0] === '.git') {
//			return; // ignore most file changes in .git folder
//		}
//	}
//	
//	if (delta.changeType !== null) {
//		var path = '/' + delta.pathArray.join('/');
//		out.push({ 
//			path: path, 
//			type: delta.changeType 
//		});
//	}
//	
//	var	children = delta.children;
//	if (children) {
//		for (var i = 0, len = children.length; i < len; i++) {
//			computePaths(children[i], out);
//		}
//	}
//} 
