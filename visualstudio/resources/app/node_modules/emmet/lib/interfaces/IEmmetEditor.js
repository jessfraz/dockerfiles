/**
 * High-level editor interface that communicates with underlying editor (like 
 * TinyMCE, CKEditor, etc.) or browser.
 * Basically, you should call <code>editor.setContext(obj)</code> method to
 * set up undelying editor context before using any other method.
 * 
 * This interface is used by <i>actions</i> for performing different 
 * actions like <b>Expand abbreviation</b>  
 * @type IEmmetEditor
 * @constructor
 * 
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */
function IEmmetEditor() {}

IEmmetEditor.prototype = {
	/**
	 * Returns character indexes of selected text: object with <code>start</code>
	 * and <code>end</code> properties. If there's no selection, should return 
	 * object with <code>start</code> and <code>end</code> properties referring
	 * to current caret position
	 * @return {Object}
	 * @example
	 * var selection = editor.getSelectionRange();
	 * alert(selection.start + ', ' + selection.end); 
	 */
	getSelectionRange: function() {
		return {
			start: 0,
			end: 0
		};
	},
	
	/**
	 * Creates selection from <code>start</code> to <code>end</code> character
	 * indexes. If <code>end</code> is ommited, this method should place caret 
	 * and <code>start</code> index
	 * @param {Number} start
	 * @param {Number} [end]
	 * @example
	 * editor.createSelection(10, 40);
	 * 
	 * //move caret to 15th character
	 * editor.createSelection(15);
	 */
	createSelection: function(start, end) {},
	
	/**
	 * Returns current line's start and end indexes as object with <code>start</code>
	 * and <code>end</code> properties
	 * @return {Object}
	 * @example
	 * var range = editor.getCurrentLineRange();
	 * alert(range.start + ', ' + range.end);
	 */
	getCurrentLineRange: function() {
		return {
			start: 0, 
			end: 0
		};
	},
	
	/**
	 * Returns current caret position
	 * @return {Number|null}
	 */
	getCaretPos: function(){},
	
	/**
	 * Set new caret position
	 * @param {Number} pos Caret position
	 */
	setCaretPos: function(pos){},
	
	/**
	 * Returns content of current line
	 * @return {String}
	 */
	getCurrentLine: function() {},
	
	/**
	 * Replace editor's content or it's part (from <code>start</code> to 
	 * <code>end</code> index). If <code>value</code> contains 
	 * <code>caret_placeholder</code>, the editor will put caret into 
	 * this position. If you skip <code>start</code> and <code>end</code>
	 * arguments, the whole target's content will be replaced with 
	 * <code>value</code>. 
	 * 
	 * If you pass <code>start</code> argument only,
	 * the <code>value</code> will be placed at <code>start</code> string 
	 * index of current content. 
	 * 
	 * If you pass <code>start</code> and <code>end</code> arguments,
	 * the corresponding substring of current target's content will be 
	 * replaced with <code>value</code>. 
	 * @param {String} value Content you want to paste
	 * @param {Number} [start] Start index of editor's content
	 * @param {Number} [end] End index of editor's content
	 * @param {Boolean} [no_indent] Do not auto indent <code>value</code>
	 */
	replaceContent: function(value, start, end, no_indent) {},
	
	/**
	 * Returns editor's content
	 * @return {String}
	 */
	getContent: function(){},
	
	/**
	 * Returns current editor's syntax mode
	 * @return {String}
	 */
	getSyntax: function(){
		return 'html';
	},
	
	/**
	 * Returns current output profile name (see profile module).
	 * In most cases, this method should return <code>null</code> and let 
	 * Emmet guess best profile name for current syntax and user data.
	 * In case you’re using advanced editor with access to syntax scopes 
	 * (like Sublime Text 2), you can return syntax name for current scope. 
	 * For example, you may return `line` profile when editor caret is inside
	 * string of programming language.
	 *  
	 * @return {String}
	 */
	getProfileName: function() {
		return 'xhtml';
	},
	
	/**
	 * Ask user to enter something
	 * @param {String} title Dialog title
	 * @return {String} Entered data
	 * @since 0.65
	 */
	prompt: function(title) {
		return '';
	},
	
	/**
	 * Returns current selection
	 * @return {String}
	 * @since 0.65
	 */
	getSelection: function() {
		return '';
	},
	
	/**
	 * Returns current editor's file path
	 * @return {String}
	 * @since 0.65 
	 */
	getFilePath: function() {
		return '';
	}
};