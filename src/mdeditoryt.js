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
    },
    
    // scroll
    
    // test: function() {
    //     var scrollingSide = null;
    //     var timeoutHandle = null;

    //     function scrollSide(side, howToScroll) {
    //         if (scrollingSide != null && scrollingSide != side) {
    //             return; // the other side hasn't finished scrolling
    //         }
    //         scrollingSide = side
    //         clearTimeout(timeoutHandle);
    //         timeoutHandle = setTimeout(function() { scrollingSide = null; }, 512);
    //         howToScroll();
    //     }

    //     function scrollEditor(scrollTop, when) {
    //         setTimeout(function() {
    //             editor.session.setScrollTop(scrollTop);
    //         }, when);
    //     }
    //     function scrollLeft(scrollTop) {
    //         scrollSide('left', function() {
    //             var current = editor.session.getScrollTop();
    //             var step = (scrollTop - current) / 8;
    //             for (var i = 1; i < 8; i++) { // to create some animation
    //                 scrollEditor(current + step * i, 128 / 8 * i);
    //             }
    //             scrollEditor(scrollTop, 128);
    //         });
    //     }

    //     function scrollRight(scrollTop) {
    //         scrollSide('right', function() {
    //             $('.ui-layout-east').animate({ scrollTop: scrollTop }, 128);
    //         });
    //     }



    //     function get_editor_scroll() {
    //         var line_markers = $('article#preview > [data-source-line]');
    //         var lines = []; // logical line
    //         line_markers.each(function() {
    //             lines.push($(this).data('source-line'));
    //         });
    //         var pLines = []; // physical line
    //         var pLine = 0;
    //         for (var i = 0; i < lines[lines.length - 1]; i++) {
    //             if ($.inArray(i + 1, lines) !== -1) {
    //                 pLines.push(pLine);
    //             }
    //             pLine += editor.session.getRowLength(i); // line height might not be 1 because of wrap
    //         }
    //         var currentLine = editor.session.getScrollTop() / editor.renderer.lineHeight; // current physical line
    //         var lastMarker = false;
    //         var nextMarker = false;
    //         for (var i = 0; i < pLines.length; i++) {
    //             if (pLines[i] < currentLine) {
    //                 lastMarker = i;
    //             } else {
    //                 nextMarker = i;
    //                 break;
    //             }
    //         } // between last marker and next marker
    //         var lastLine = 0;
    //         var nextLine = editor.session.getScreenLength() - 1; // on the top of last physical line, so -1
    //         if (lastMarker !== false) {
    //             lastLine = pLines[lastMarker];
    //         }
    //         if (nextMarker !== false) {
    //             nextLine = pLines[nextMarker];
    //         } // physical lines of two neighboring markers
    //         var percentage = 0;
    //         if (nextLine !== lastLine) { // at the beginning of file, equal, but cannot divide by 0
    //             percentage = (currentLine - lastLine) / (nextLine - lastLine);
    //         } // scroll percentage between two markers
    //         // returns two neighboring markers' logical lines, and current scroll percentage between two markers
    //         return { lastMarker: lines[lastMarker], nextMarker: lines[nextMarker], percentage: percentage };
    //     }

    //     function set_preview_scroll(editor_scroll) {
    //         var lastPosition = 0;
    //         var nextPosition = $('article#preview').outerHeight() - $('.ui-layout-east').height(); // maximum scroll
    //         if (editor_scroll.lastMarker !== undefined) { // no marker at very start
    //             lastPosition = $('article#preview').find('>[data-source-line="' + editor_scroll.lastMarker + '"]').get(0).offsetTop;
    //         }
    //         if (editor_scroll.nextMarker !== undefined) { // no marker at very end
    //             nextPosition = $('article#preview').find('>[data-source-line="' + editor_scroll.nextMarker + '"]').get(0).offsetTop;
    //         }
    //         var scrollTop = lastPosition + (nextPosition - lastPosition) * editor_scroll.percentage; // right scroll according to left percentage
    //         scrollRight(scrollTop);
    //     }

    //     function get_preview_scroll() {
    //         var scroll = $('.ui-layout-east').scrollTop();
    //         var lastMarker = false;
    //         var nextMarker = false;
    //         var line_markers = $('article#preview > [data-source-line]');
    //         for (var i = 0; i < line_markers.length; i++) {
    //             if (line_markers[i].offsetTop < scroll) {
    //                 lastMarker = i;
    //             } else {
    //                 nextMarker = i;
    //                 break;
    //             }
    //         }
    //         var lastLine = 0;
    //         var nextLine = $('article#preview').outerHeight() - $('.ui-layout-east').height(); // maximum scroll
    //         if (lastMarker !== false) {
    //             lastLine = line_markers[lastMarker].offsetTop;
    //         }
    //         if (nextMarker !== false) {
    //             nextLine = line_markers[nextMarker].offsetTop;
    //         }
    //         var percentage = 0;
    //         if (nextLine !== lastLine) {
    //             percentage = (scroll - lastLine) / (nextLine - lastLine);
    //         }
    //         // returns two neighboring markers' No., and current scroll percentage between two markers
    //         return { lastMarker: lastMarker, nextMarker: nextMarker, percentage: percentage };
    //     }

    //     function set_editor_scroll(preview_scroll) {
    //         var line_markers = $('article#preview > [data-source-line]');
    //         var lines = []; // logical line
    //         line_markers.each(function() {
    //             lines.push($(this).data('source-line'));
    //         });
    //         var pLines = []; // physical line
    //         var pLine = 0;
    //         for (var i = 0; i < lines[lines.length - 1]; i++) {
    //             if ($.inArray(i + 1, lines) !== -1) {
    //                 pLines.push(pLine);
    //             }
    //             pLine += editor.session.getRowLength(i) // line height might not be 1 because of wrap
    //         }
    //         var lastLine = 0;
    //         var nextLine = editor.session.getScreenLength() - 1; // on the top of last physical line, so -1
    //         if (preview_scroll.lastMarker !== false) {
    //             lastLine = pLines[preview_scroll.lastMarker]
    //         }
    //         if (preview_scroll.nextMarker !== false) {
    //             nextLine = pLines[preview_scroll.nextMarker]
    //         }
    //         var scrollTop = ((nextLine - lastLine) * preview_scroll.percentage + lastLine) * editor.renderer.lineHeight;
    //         scrollLeft(scrollTop);
    //     }



    //     var sync_preview = _.debounce(function() { // sync right with left
    //         if (layout.state.east.isClosed) {
    //             return; // no need to sync if panel closed
    //         }
    //         if (scrollingSide != 'left') {
    //             set_preview_scroll(get_editor_scroll());
    //         }
    //     }, 128, false);

    //     var sync_editor = _.debounce(function() { // sync left with right
    //         if (layout.state.east.isClosed) {
    //             return; // no need to sync if panel closed
    //         }
    //         if (scrollingSide != 'right') {
    //             set_editor_scroll(get_preview_scroll());
    //         }
    //     }, 128, false);
    // },
    
//     editor.session.on('changeScrollTop', function(scroll) {
//     sync_preview(); // right scroll with left
//   });
    
//     $('.ui-layout-east').scroll(function() { // left scroll with right
//     sync_editor();
//   });

// var cmBindScroll = function() {    
//                 codeMirror.find(".CodeMirror-scroll").bind(mouseOrTouch("scroll", "touchmove"), function(event) {
//                     var height    = $(this).height();
//                     var scrollTop = $(this).scrollTop();                    
//                     var percent   = (scrollTop / $(this)[0].scrollHeight);
                    
//                     var tocHeight = 0;
                    
//                     preview.find(".markdown-toc-list").each(function(){
//                         tocHeight += $(this).height();
//                     });
                    
//                     var tocMenuHeight = preview.find(".editormd-toc-menu").height();
//                     tocMenuHeight = (!tocMenuHeight) ? 0 : tocMenuHeight;

//                     if (scrollTop === 0) 
//                     {
//                         preview.scrollTop(0);
//                     } 
//                     else if (scrollTop + height >= $(this)[0].scrollHeight - 16)
//                     { 
//                         preview.scrollTop(preview[0].scrollHeight);                        
//                     } 
//                     else
//                     {
//                         preview.scrollTop((preview[0].scrollHeight  + tocHeight + tocMenuHeight) * percent);
//                     }
                    
//                     $.proxy(settings.onscroll, _this)(event);
//                 });
//             };


//  var previewBindScroll = function() {
                
//                 preview.bind(mouseOrTouch("scroll", "touchmove"), function(event) {
//                     var height    = $(this).height();
//                     var scrollTop = $(this).scrollTop();         
//                     var percent   = (scrollTop / $(this)[0].scrollHeight);
//                     var codeView  = codeMirror.find(".CodeMirror-scroll");

//                     if(scrollTop === 0) 
//                     {
//                         codeView.scrollTop(0);
//                     }
//                     else if (scrollTop + height >= $(this)[0].scrollHeight)
//                     {
//                         codeView.scrollTop(codeView[0].scrollHeight);                        
//                     }
//                     else 
//                     {
//                         codeView.scrollTop(codeView[0].scrollHeight * percent);
//                     }
                    
//                     $.proxy(settings.onpreviewscroll, _this)(event);
//                 });

//             };
    
} 

module.exports = function(id, settingOptions) {
    var mdEditorYt = new MdEditorYt();
    mdEditorYt.init(id, settingOptions);
    return mdEditorYt;
};

},{}]},{},[1])(1)
});
