// -------------------------------------------------------------------
// markItUp!
// -------------------------------------------------------------------
// Copyright (C) 2008 Jay Salvat
// http://markitup.jaysalvat.com/
// -------------------------------------------------------------------
// MarkDown tags example
// http://en.wikipedia.org/wiki/Markdown
// http://daringfireball.net/projects/markdown/
// -------------------------------------------------------------------
// Feel free to add more tags
// -------------------------------------------------------------------
markdown_settings = {
    previewParserPath:	'',
    onShiftEnter:		{keepDefault:false, openWith:function() { return '\n\n'; }},
    markupSet: [
	//{name:'First Level Heading', key:'1', placeHolder:'Your title here...', closeWith:function(markItUp) { return miu.markdownTitle(markItUp, '=') } },
	//{name:'Second Level Heading', key:'2', placeHolder:'Your title here...', closeWith:function(markItUp) { return miu.markdownTitle(markItUp, '-') } },
	{name:'Heading 1', key:'1', openWith:function() { return '# '; }, placeHolder:function() { return 'Your title here...';} },
	{name:'Heading 2', key:'2', openWith:function() { return '## '; }, placeHolder:function() { return 'Your title here...';} },
	{name:'Heading 3', key:'3', openWith:function() { return '### '; }, placeHolder:function() { return 'Your title here...';} },
	{name:'Heading 4', key:'4', openWith:function() { return '#### '; }, placeHolder:function() { return 'Your title here...';} },
	{name:'Heading 5', key:'5', openWith:function() { return '##### '; }, placeHolder:function() { return 'Your title here...';} },
	{name:'Heading 6', key:'6', openWith:function() { return '###### '; }, placeHolder:function() { return 'Your title here...';} },
	{separator:'---------------' },		
	{name:'Bold', key:'B', openWith:function() { return '**'; }, closeWith:function() { return '**'; }},
	{name:'Italic', key:'I', openWith:function() { return '_'; }, closeWith:function() { return '_'; }},
	{separator:'---------------' },
	{name:'Bulleted List', openWith:function() { return '- '; } },
	{name:'Numeric List', openWith:function() { return function(markItUp) {
	    return markItUp.line+'. '; };
	}},
	{separator:'---------------' },
	//{name:'Picture', key:'P', replaceWith:'![[![Alternative text]!]]([![Url:!:http://]!] "[![Title]!]")'},
	{name:'Link', key:'L', openWith:function() { return '['; }, closeWith:function() { return ']([![Url:!:http://]!] "[![Title]!]")'; }, placeHolder:function() { return 'Your text to link here...';} },
	{separator:'---------------'},	
	{name:'Quotes', openWith:function() { return '> '; }},
	{name:'Code Block / Code', openWith:function() { return '(!(\t|!|`)!)'; }, closeWith:function() { return '(!(`)!)'; }},
	{separator:'---------------'}
	// {name:'note', key:'d', 
	//  openWith: function() { return 'opennote_'+imp.loggedin_username+'\n'; }, 
	//  closeWith:function() { return 'closenote_'+imp.loggedin_username; },
	//  placeHolder: function() { return 'on '+imp.loggedin_username+' said\n'; } }

	//{name:'Preview', call:'preview', className:"preview"}
    ]
}

// mIu nameSpace to avoid conflict.
miu = {
	markdownTitle: function(markItUp, char) {
		heading = '';
		n = $.trim(markItUp.selection||markItUp.placeHolder).length;
		for(i = 0; i < n; i++) {
			heading += char;
		}
		return '\n'+heading;
	}
}