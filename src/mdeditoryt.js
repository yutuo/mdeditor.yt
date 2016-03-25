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
    matchBrackets: true,
    indentWithTabs: true,
    styleSelectedText: true,
    matchWordHighlight: true,
    autoCloseBrackets: true,
    showTrailingSpace: true,
    scrollPastEnd: true,
    value: '',
    
    delay: 300,
    searchReplace: true,
    syncScrolling: true,
    mdValueName: '',
    htmlValueName: '',
    
    onload: function() { },
    onchange: function() { },
};
 
var timer;
var MdEditorYt = function() {};

MdEditorYt.mouseOrTouch = function (mouseEventType, touchEventType) {
    mouseEventType = mouseEventType || "click";
    touchEventType = touchEventType || "touchend";

    var eventType = mouseEventType;

    try {
        document.createEvent("TouchEvent");
        eventType = touchEventType;
    } catch (e) {
    }

    return eventType;
};

MdEditorYt.prototype = {
    options: {},
    init: function (id, settingOptions) {
        this.options = $.extend(true, defaults, settingOptions);
        this.options.useSourceLine = this.options.syncScrolling ? true : this.options.useSourceLine;
        // Editor的设置
        this.editor = (typeof id === "object") ? $(id) : $("#" + id);
        this.editor.addClass('MdEditorYt CodeMirror');
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
            scrollPastEnd: this.options.scrollPastEnd,
            value: this.options.value,
            // extraKeys: {
            //     "Ctrl-Q": function (cm) {
            //         cm.foldCode(cm.getCursor());
            //     }
            // },
            foldGutter: this.options.codeFold,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            matchBrackets: this.options.matchBrackets,
            indentWithTabs: this.options.indentWithTabs,
            styleActiveLine: this.options.styleActiveLine,
            styleSelectedText: this.options.styleSelectedText,
            autoCloseBrackets: this.options.autoCloseBrackets,
            showTrailingSpace: this.options.showTrailingSpace,
            highlightSelectionMatches: ( (!this.options.matchWordHighlight) ? false : {showToken: (this.options.matchWordHighlight === "onselected") ? false : /\w/} )
        };
        
        this.cmEditor = new CodeMirror(this.cmContainer.get(0), codeMirrorConfig);
        this.setTheme(this.options.editorTheme);
        this.cmEditorDiv = this.cmContainer.find('.CodeMirror');
        
        // 预览高度设置
        this.preview.height(this.cmContainer.get(0).offsetHeight);        
        
        this.markdownYt = new MarkdownYt(this.options);
        
        this.save();
        this.bindChangeEvent();
        this.options.onload(this);

        return this;
    },
    
    setTheme: function(themeName) {
        var oldTheme = this.cmEditor.getOption('theme');
        this.cmContainer.removeClass('cm-s-' + oldTheme).addClass('cm-s-' + themeName);
        this.cmEditor.setOption("theme", themeName);
        return this;
    },

    bindChangeEvent: function () {
        var _this = this;
        this.cmEditor.on("change", function () {
            timer = setTimeout(function () {
                clearTimeout(timer);
                _this.save();
                _this.cmEditorScroll(_this);
                _this.options.onchange(_this);
                timer = null;
            }, _this.options.delay);
        });
        
        this.bindScrollEvent();
        
        return this;
    },
    
    save: function() {
        if (timer === null) {
            return this;
        }
        
        var mdValue = this.cmEditor.getValue();
        if (this.options.mdValueName) {
            this.mdValue.val(mdValue);
        }

        var htmlValue = this.markdownYt.render(mdValue);
        if (this.options.htmlValueName) {
            this.htmlValue.val(htmlValue.replace(/(<\w+[^>]*) data-source-line=(['"])\d+\2([^>]*>)/g, "$1$3"));
        }
        
        try {
            this.previewContainer.html(htmlValue);
            var childrens = this.previewContainer.children();
            var paddingHeight = this.cmContainer.get(0).offsetHeight;
            if (childrens) {
                paddingHeight -= childrens[childrens.length - 1].offsetHeight;
            }
            this.previewContainer.css('padding-bottom', paddingHeight + 'px')
        }
        catch (err) {
            // do nothing
        }
        
        
    },
    
    bindScrollEvent: function() {
        if (!this.options.syncScrolling) {
            return;
        }
        
        var _this = this;

        var cmEditorBindScroll = function () {                
            _this.cmEditorDiv.find(".CodeMirror-scroll").bind("scroll", function() { _this.cmEditorScroll(_this) });
        };

        var cmEditorUnbindScroll = function () {
            _this.cmEditorDiv.find(".CodeMirror-scroll").unbind("scroll");
        };

        var previewBindScroll = function () {
            _this.preview.bind("scroll", function() { _this.previewScroll(_this) });
        };

        var previewUnbindScroll = function () {
            _this.preview.unbind("scroll");
        };

        this.cmEditorDiv.bind({
            mouseover: cmEditorBindScroll,
            mouseout: cmEditorUnbindScroll,
            touchstart: cmEditorBindScroll,
            touchend: cmEditorUnbindScroll
        });

        this.preview.bind({
            mouseover: previewBindScroll,
            mouseout: previewUnbindScroll,
            touchstart: previewBindScroll,
            touchend: previewUnbindScroll
        });
    },
    

    previewScroll: function(_this) {
        var lineMarkers = _this.previewContainer.find('[data-source-line]');
        
        function getPreviewScroll() {
            var scroll = _this.preview.scrollTop();
            var lastMarker = false;
            var nextMarker = false;
            
            for (var i = 0; i < lineMarkers.length; i++) {
                if (lineMarkers[i].offsetTop < scroll) {
                    lastMarker = i;
                } else {
                    nextMarker = i;
                    break;
                }
            }
            
            var lastLineHeight = 0;
            var nextLineHeight = _this.previewContainer.outerHeight() - _this.preview.outerHeight();
            if (lastMarker !== false) {
                lastLineHeight = lineMarkers[lastMarker].offsetTop;
            }
            if (nextMarker !== false) {
                nextLineHeight = lineMarkers[nextMarker].offsetTop;
            }
            var percentage = 0;
            if (nextLineHeight !== lastLineHeight) {
                percentage = (scroll - lastLineHeight) / (nextLineHeight - lastLineHeight);
            }

            return { lastMarker: lastMarker, nextMarker: nextMarker, percentage: percentage };
        }

        function setEditorScroll(previewScroll) {
            var lines = [];
            lineMarkers.each(function() {
                lines.push($(this).data('source-line'));
            });

            var pLineHeights = [];
            var pLineHeight = 0;
            for (var i = 0; i < lines[lines.length - 1]; i++) {
                if ($.inArray(i + 1, lines) !== -1) {
                    pLineHeights.push(pLineHeight);
                }
                pLineHeight +=  _this.cmEditor.getLineHandle(i).height;
            }
            
            var lastLineHeight = 0;
            var nextLineHeight = 0;
            if (previewScroll.lastMarker !== false) {
                lastLineHeight = pLineHeights[previewScroll.lastMarker]
            }
            if (previewScroll.nextMarker !== false) {
                nextLineHeight = pLineHeights[previewScroll.nextMarker]
            }
            else {
                for (var i = 0; i < _this.cmEditor.lineCount(); i++) {
                    nextLineHeight += _this.cmEditor.getLineHandle(i).height;
                }
            }
            var scrollTop = ((nextLineHeight - lastLineHeight) * previewScroll.percentage + lastLineHeight);
            _this.cmEditor.scrollTo(0, scrollTop);
        }
        
        setEditorScroll(getPreviewScroll());
    },
    
    cmEditorScroll: function(_this) {
   
        var lineMarkers = _this.previewContainer.find('[data-source-line]');
        
        function getEditorScroll() {
            var lines = [];
            lineMarkers.each(function() {
                lines.push($(this).data('source-line'));
            });

            var pLineHeights = [];
            var pLineHeight = 0;
            for (var i = 0; i < lines[lines.length - 1]; i++) {
                if ($.inArray(i + 1, lines) !== -1) {
                    pLineHeights.push(pLineHeight);
                }
                pLineHeight +=  _this.cmEditor.getLineHandle(i).height;
            }

            var currentLineHeight = _this.cmEditor.getScrollInfo().top;
            var lastMarker = false;
            var nextMarker = false;
            for (var i = 0; i < pLineHeights.length; i++) {
                if (pLineHeights[i] < currentLineHeight) {
                    lastMarker = i;
                } else {
                    nextMarker = i;
                    break;
                }
            }
            
            var lastLineHeight = 0;
            var nextLineHeight = 0;
            if (lastMarker !== false) {
                lastLineHeight = pLineHeights[lastMarker];
            }
            if (nextMarker !== false) {
                nextLineHeight = pLineHeights[nextMarker];
            }
            else {
                for (var i = 0; i < _this.cmEditor.lineCount(); i++) {
                    nextLineHeight += _this.cmEditor.getLineHandle(i).height;
                }
            }
            var percentage = 0;
            if (nextLineHeight !== lastLineHeight) {
                percentage = (currentLineHeight - lastLineHeight) / (nextLineHeight - lastLineHeight);
            }
            
            return { lastMarker: lines[lastMarker], nextMarker: lines[nextMarker], percentage: percentage };
        }

        function setPreviewScroll(editorScroll) {
            var lastPosition = 0;
            var nextPosition = _this.previewContainer.outerHeight() - _this.preview.outerHeight();
            if (editorScroll.lastMarker !== undefined) {
                lastPosition = _this.previewContainer.find('>[data-source-line="' + editorScroll.lastMarker + '"]').get(0).offsetTop;
            }
            if (editorScroll.nextMarker !== undefined) {
                nextPosition = _this.previewContainer.find('>[data-source-line="' + editorScroll.nextMarker + '"]').get(0).offsetTop;
            }
            var scrollTop = lastPosition + (nextPosition - lastPosition) * editorScroll.percentage;
            _this.preview.scrollTop(scrollTop);
        }
        
        setPreviewScroll(getEditorScroll());
    },    
}

module.exports = function(id, settingOptions) {
    var mdEditorYt = new MdEditorYt();
    mdEditorYt.init(id, settingOptions);
    return mdEditorYt;
};

},{}]},{},[1])(1)
});
