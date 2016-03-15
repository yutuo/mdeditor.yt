/*! mdeditor.js https://github.com/yutuo/markdown.yt @license MIT */(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MdEditorYt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}
)({1:[function(require,module,exports){

'use strict';

var $ = jQuery;

var defaults = {
    html:           true,        // Enable HTML tags in source
    xhtmlOut:       true,        // Use '/' to close single tags (<br />)
    breaks:         true,        // Convert '\n' in paragraphs into <br>
    linkify:        true,         // autoconvert URL-like texts to links
    typographer:    false,         // Enable smartypants and other sweet transforms


    useAbbr:        true,
    useContainer:   true,
    useDeflist:     true,
    useEmoji:       true,
    useFootnote:    true,
    useIns:         true,
    useMark:        true,
    useSub:         true,
    useSup:         true,
    useToc:         true,
    useMath:        true,

    useLinkNewWin:  false,
    useSourceLine:  true,
    useCodeBlockPre:false,
    
    highlight:      true,
    useLineNumber:  true,
    useShowLangName:true,
    
    editorTheme: 'default',
    tabSize: 4,
    dragDrop: false,
    lineNumbers: true,
    lineWrapping: true,
    autoFocus: true,
    autoCloseTags: true,
    readOnly: false,
    indentUnit: 4,
    value: '',
    
    delay: 300,
    searchReplace: true,
    syncScrolling: true,
    mdValueName: '',
    htmlValueName: '',
    
};

            
var timer;
var MdEditorYt = function() {};

MdEditorYt.prototype = {
    options: {},
    init: function (id, settingOptions) {
        this.options = $.extend(true, defaults, settingOptions);
        // Editor的设置
        this.editor = (typeof id === "object") ? $(id) : $("#" + id);
        this.editor.addClass('MdEditorYt');
        this.editor.css({
            width: (typeof this.options.width === "number") ? this.options.width + "px" : this.options.width,
            height: (typeof this.options.height === "number") ? this.options.height + "px" : this.options.height
        });
        
        this.preview = $('<div class="preview"></div>');
        this.editor.append(this.preview);
        
        this.previewContainer = $('<div class="previewContainer"></div>');
        this.preview.append(this.previewContainer);
        
        this.mdValue = $('<textarea class="mdValue" name="' + this.options.mdValueName + '"></textarea>');
        this.editor.append(this.mdValue);
        
        this.htmlValue = $('<textarea class="htmlValue" name="' + this.options.htmlValueName + '"></textarea>');
        this.editor.append(this.htmlValue);
        
        // CodeMirror的设置
        this.cmContainer = $('<div class="cmContainer"></div>');
        this.editor.append(this.cmContainer);
        
        var codeMirrorConfig = {
            mode: 'markdown',
            theme: this.options.editorTheme,
            tabSize: this.options.tabSize,
            dragDrop: this.options.dragDrop,
            autofocus: this.options.autoFocus,
            autoCloseTags: this.options.autoCloseTags,
            readOnly: (this.options.readOnly) ? "nocursor" : false,
            indentUnit: this.options.indentUnit,
            lineNumbers: this.options.lineNumbers,
            lineWrapping: this.options.lineWrapping,
            value: this.options.value,
            // extraKeys: {
            //     "Ctrl-Q": function (cm) {
            //         cm.foldCode(cm.getCursor());
            //     }
            // },
            // foldGutter: settings.codeFold,
            // gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            // matchBrackets: settings.matchBrackets,
            // indentWithTabs: settings.indentWithTabs,
            // styleActiveLine: settings.styleActiveLine,
            // styleSelectedText: settings.styleSelectedText,
            // autoCloseBrackets: settings.autoCloseBrackets,
            // showTrailingSpace: settings.showTrailingSpace,
            // highlightSelectionMatches: ( (!settings.matchWordHighlight) ? false : {showToken: (settings.matchWordHighlight === "onselected") ? false : /\w/} )
        };
        
        this.cmEditor = new CodeMirror(this.cmContainer.get(0), codeMirrorConfig);
        
        // 预览高度设置
        this.preview.height(this.cmContainer.get(0).offsetHeight);
        
        this.markdownYt = new MarkdownYt(this.options);
        
        this.save();
        this.bindChangeEvent();
        
        return this;
    },
    
    bindChangeEvent: function () {
        var _this = this;
        this.cmEditor.on("change", function () {
            timer = setTimeout(function () {
                clearTimeout(timer);
                _this.save();
                timer = null;
            }, _this.options.delay);
        });
        return this;
    },
    
    save: function() {
        if (timer === null) {
            return this;
        }
        
        var mdValue = this.cmEditor.getValue();
        this.mdValue.val(mdValue);
        
        var htmlValue = this.markdownYt.render(mdValue);
        this.htmlValue.val(htmlValue);
        
        this.previewContainer.html(htmlValue);
    }
    
    
} 

module.exports = function(id, settingOptions) {
    var mdEditorYt = new MdEditorYt();
    mdEditorYt.init(id, settingOptions);
    return mdEditorYt;
};

},{}]},{},[1])(1)
});
