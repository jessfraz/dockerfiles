/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports"], function (require, exports) {
    exports.snippets = [
        {
            type: 'snippet',
            label: 'attribute',
            codeSnippet: [
                '[System.AttributeUsage(System.AttributeTargets.{{All}}, Inherited = {{false}}, AllowMultiple = {{true}})]',
                'sealed class {{My}}Attribute : System.Attribute',
                '{',
                '	// See the attribute guidelines at',
                '	//  http://go.microsoft.com/fwlink/?LinkId=85236',
                '	readonly string positionalString;',
                '	',
                '	// This is a positional argument',
                '	public {{My}}Attribute (string positionalString)',
                '	{',
                '		this.positionalString = positionalString;',
                '		',
                '		// TODO: Implement code here',
                '		{{throw new System.NotImplementedException();}}',
                '	}',
                '	',
                '	public string PositionalString',
                '	{',
                '		get { return positionalString; }',
                '	}',
                '	',
                '	// This is a named argument',
                '	public int NamedInt { get; set; }',
                '}'
            ].join('\n'),
            documentationLabel: 'Attribute using recommended pattern'
        },
        {
            type: 'snippet',
            label: 'checked',
            codeSnippet: [
                'checked',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'Checked block'
        },
        {
            type: 'snippet',
            label: 'class',
            codeSnippet: [
                'class {{Name}}',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'Class'
        },
        {
            type: 'snippet',
            label: 'cw',
            codeSnippet: [
                'System.Console.WriteLine({{}});'
            ].join('\n'),
            documentationLabel: 'Console.WriteLine'
        },
        {
            type: 'snippet',
            label: 'do',
            codeSnippet: [
                'do',
                '{',
                '	{{}}',
                '} while ({{true}});'
            ].join('\n'),
            documentationLabel: 'do...while loop'
        },
        {
            type: 'snippet',
            label: 'else',
            codeSnippet: [
                'else',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'Else statement'
        },
        {
            type: 'snippet',
            label: 'enum',
            codeSnippet: [
                'enum {{Name}}',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'Enum'
        },
        {
            type: 'snippet',
            label: 'equals',
            codeSnippet: [
                '// override object.Equals',
                'public override bool Equals (object obj)',
                '{',
                '	//',
                '	// See the full list of guidelines at',
                '	//   http://go.microsoft.com/fwlink/?LinkID=85237',
                '	// and also the guidance for operator== at',
                '	//   http://go.microsoft.com/fwlink/?LinkId=85238',
                '	//',
                '	',
                '	if (obj == null || GetType() != obj.GetType())',
                '	{',
                '		return false;',
                '	}',
                '	',
                '	// TODO: write your implementation of Equals() here',
                '	{{1:throw new System.NotImplementedException();}}',
                '	return base.Equals (obj);',
                '}',
                '',
                '// override object.GetHashCode',
                'public override int GetHashCode()',
                '{',
                '	// TODO: write your implementation of GetHashCode() here',
                '	{{2:throw new System.NotImplementedException();}}',
                '	return base.GetHashCode();',
                '}'
            ].join('\n'),
            documentationLabel: 'Implementing Equals() according to guidelines'
        },
        {
            type: 'snippet',
            label: 'exception',
            codeSnippet: [
                '[System.Serializable]',
                'public class {{My}}Exception : {{System.Exception}}',
                '{',
                '	public {{My}}Exception() { }',
                '	public {{My}}Exception( string message ) : base( message ) { }',
                '	public {{My}}Exception( string message, System.Exception inner ) : base( message, inner ) { }',
                '	protected {{My}}Exception(',
                '		System.Runtime.Serialization.SerializationInfo info,',
                '		System.Runtime.Serialization.StreamingContext context ) : base( info, context ) { }',
                '}'
            ].join('\n'),
            documentationLabel: 'Exception'
        },
        {
            type: 'snippet',
            label: 'foreach',
            codeSnippet: [
                'foreach ({{var}} {{item}} in {{collection}})',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'Foreach statement'
        },
        {
            type: 'snippet',
            label: 'forr',
            codeSnippet: [
                'for (int {{i}} = {{length}} - 1; {{i}} >= 0 ; {{i}}--)',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'Reverse for loop'
        },
        {
            type: 'snippet',
            label: 'for',
            codeSnippet: [
                'for (int {{i}} = 0; {{i}} < {{length}}; {{i}}++)',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'for loop'
        },
        {
            type: 'snippet',
            label: 'if',
            codeSnippet: [
                'if ({{true}})',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'if statement'
        },
        {
            type: 'snippet',
            label: 'indexer',
            codeSnippet: [
                '{{public}} {{object}} this[{{int}} index]',
                '{',
                '	get { {{/* return the specified index here */}} }',
                '	set { {{/* set the specified index to value here */}} }',
                '}'
            ].join('\n'),
            documentationLabel: 'Indexer'
        },
        {
            type: 'snippet',
            label: 'interface',
            codeSnippet: [
                'interface I{{Name}}',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'Interface'
        },
        {
            type: 'snippet',
            label: 'invoke',
            codeSnippet: [
                '{{EventHandler}} temp = {{MyEvent}};',
                'if (temp != null)',
                '{',
                '	temp({{}});',
                '}'
            ].join('\n'),
            documentationLabel: 'Safely invoking an event'
        },
        {
            type: 'snippet',
            label: 'iterator',
            codeSnippet: [
                'public System.Collections.Generic.IEnumerator<{{ElementType}}> GetEnumerator()',
                '{',
                '	{{}}throw new System.NotImplementedException();',
                '	yield return default({{ElementType}});',
                '}'
            ].join('\n'),
            documentationLabel: 'Simple iterator'
        },
        {
            type: 'snippet',
            label: 'iterindex',
            codeSnippet: [
                'public {{Name}}Iterator {{Name}}',
                '{',
                '	get',
                '	{',
                '		return new {{Name}}Iterator(this);',
                '	}',
                '}',
                '',
                'public class {{Name}}Iterator',
                '{',
                '	readonly {{ClassName}} outer;',
                '	',
                '	internal {{Name}}Iterator({{ClassName}} outer)',
                '	{',
                '		this.outer = outer;',
                '	}',
                '	',
                '	// TODO: provide an appropriate implementation here',
                '	public int Length { get { return 1; } }',
                '	',
                '	public {{ElementType}} this[int index]',
                '	{',
                '		get',
                '		{',
                '			//',
                '			// TODO: implement indexer here',
                '			//',
                '			// you have full access to {{ClassName}} privates',
                '			//',
                '			{{throw new System.NotImplementedException();}}',
                '			return default({{ElementType}});',
                '		}',
                '	}',
                '	',
                '	public System.Collections.Generic.IEnumerator<{{ElementType}}> GetEnumerator()',
                '	{',
                '		for (int i = 0; i < this.Length; i++)',
                '		{',
                '			yield return this[i];',
                '		}',
                '	}',
                '}'
            ].join('\n'),
            documentationLabel: 'Named iterator/indexer pair using a nested class'
        },
        {
            type: 'snippet',
            label: 'lock',
            codeSnippet: [
                'lock ({{this}})',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'Lock statement'
        },
        {
            type: 'snippet',
            label: 'mbox',
            codeSnippet: [
                'System.Windows.Forms.MessageBox.Show("{{Text}}");{{}}'
            ].join('\n'),
            documentationLabel: 'MessageBox.Show'
        },
        {
            type: 'snippet',
            label: 'namespace',
            codeSnippet: [
                'namespace {{Name}}',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'Namespace'
        },
        {
            type: 'snippet',
            label: 'ifd',
            codeSnippet: [
                '#if {{true}}',
                '	{{}}',
                '#endif'
            ].join('\n'),
            documentationLabel: '#if'
        },
        {
            type: 'snippet',
            label: 'region',
            codeSnippet: [
                '#region {{Name}}',
                '	{{}}',
                '#endregion'
            ].join('\n'),
            documentationLabel: '#region'
        },
        {
            type: 'snippet',
            label: 'propfull',
            codeSnippet: [
                'private {{int}} {{myVar}};',
                'public {{int}} {{MyProperty}}',
                '{',
                '	get { return {{myVar}};}',
                '	set { {{myVar}} = value;}',
                '}',
                '{{}}'
            ].join('\n'),
            documentationLabel: 'Property and backing field'
        },
        {
            type: 'snippet',
            label: 'propg',
            codeSnippet: [
                'public {{int}} {{MyProperty}} { get; private set; }{{}}'
            ].join('\n'),
            documentationLabel: 'An automatically implemented property with a \'get\' accessor and a private \'set\' accessor. C# 3.0 or higher'
        },
        {
            type: 'snippet',
            label: 'prop',
            codeSnippet: [
                'public {{int}} {{MyProperty}} { get; set; }{{}}'
            ].join('\n'),
            documentationLabel: 'An automatically implemented property. C# 3.0 or higher'
        },
        {
            type: 'snippet',
            label: 'sim',
            codeSnippet: [
                'static int Main(string[] args)',
                '{',
                '	{{}}',
                '	return 0;',
                '}'
            ].join('\n'),
            documentationLabel: 'int Main()'
        },
        {
            type: 'snippet',
            label: 'struct',
            codeSnippet: [
                'struct {{Name}}',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'Struct'
        },
        {
            type: 'snippet',
            label: 'svm',
            codeSnippet: [
                'static void Main(string[] args)',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'void Main()'
        },
        {
            type: 'snippet',
            label: 'switch',
            codeSnippet: [
                'switch ({{switch_on}})',
                '{',
                '	{{}}',
                '	default:',
                '}'
            ].join('\n'),
            documentationLabel: 'Switch statement'
        },
        {
            type: 'snippet',
            label: 'tryf',
            codeSnippet: [
                'try',
                '{',
                '	{{_}}',
                '}',
                'finally',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'Try finally'
        },
        {
            type: 'snippet',
            label: 'try',
            codeSnippet: [
                'try',
                '{',
                '	{{_}}',
                '}',
                'catch ({{System.Exception}})',
                '{',
                '	{{}}',
                '	throw;',
                '}'
            ].join('\n'),
            documentationLabel: 'Try catch'
        },
        {
            type: 'snippet',
            label: 'unchecked',
            codeSnippet: [
                'unchecked',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'Unchecked block'
        },
        {
            type: 'snippet',
            label: 'unsafe',
            codeSnippet: [
                'unsafe',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'Unsafe statement'
        },
        {
            type: 'snippet',
            label: 'using',
            codeSnippet: [
                'using({{resource}})',
                '{',
                '	{{}}',
                '}',
            ].join('\n'),
            documentationLabel: 'Using statement'
        },
        {
            type: 'snippet',
            label: 'while',
            codeSnippet: [
                'while ({{true}})',
                '{',
                '	{{}}',
                '}'
            ].join('\n'),
            documentationLabel: 'While loop'
        }
    ];
});
