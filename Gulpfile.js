"use strict";

var os = require("os");
var gulp = require("gulp");
var gutil = require("gulp-util");
var sass = require("gulp-ruby-sass");
var jshint = require("gulp-jshint");
var uglify = require("gulp-uglifyjs");
var rename = require("gulp-rename");
var concat = require("gulp-concat");
var notify = require("gulp-notify");
var header = require("gulp-header");
var minifycss = require("gulp-minify-css");
//var jsdoc        = require("gulp-jsdoc");
//var jsdoc2md     = require("gulp-jsdoc-to-markdown");
var pkg = require("./package.json");
var dateFormat = require("dateformatter").format;
var replace = require("gulp-replace");

pkg.name = "MdEditor.yt";
pkg.today = dateFormat;

var headerComment = ["/*",
    " * <%= pkg.name %>",
    " *",
    " * @file        <%= fileName(file) %> ",
    " * @version     v<%= pkg.version %> ",
    " * @description <%= pkg.description %>",
    " * @license     MIT License",
    " * @author      <%= pkg.author %>",
    " * {@link       <%= pkg.homepage %>}",
    " */",
    "\r\n"].join("\r\n");

var headerMiniComment = "/*! <%= pkg.name %> v<%= pkg.version %> | <%= fileName(file) %> | <%= pkg.description %> | MIT License | By: <%= pkg.author %> | <%= pkg.homepage %> | <%=pkg.today('Y-m-d') %> */\r\n";

var dist = 'dist';

var cssSrcs = [
    'lib/markdownyt/markdownyt.css',
    'css/mdeditoryt.css',
];

gulp.task("css", function () {
    return gulp.src(cssSrcs)
        .pipe(concat("mdeditoryt.css"))
        .pipe(gulp.dest(dist))
        .pipe(concat("mdeditoryt.min.css"))
        .pipe(minifycss({compatibility: 'ie8'}))
        .pipe(gulp.dest(dist))
        .pipe(notify({message: "MdEditorYt css task complete!"}));
});

var jsSrcs = [
    'lib/markdownyt/markdownyt.js',
    'src/mdeditoryt.js',
];

gulp.task("js", function () {
    return gulp.src(jsSrcs)
        .pipe(concat("mdeditoryt.js"))
        .pipe(gulp.dest(dist))
        .pipe(concat("mdeditoryt.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest(dist))
        .pipe(header(headerMiniComment, {
            pkg: pkg, fileName: function (file) {
                var name = file.path.split(file.base + "\\");
                return (name[1] ? name[1] : name[0]).replace(/\\/g, "");
            }
        }))
        .pipe(gulp.dest(dist))
        .pipe(notify({message: "MdEditorYt js task complete!"}));
});

var cmPath = 'lib/codemirror';
var cmJsSrcs = [
    cmPath + "/lib/codemirror.js",
    cmPath + "/addon/mode/simple.js",
    cmPath + "/addon/mode/overlay.js",
    cmPath + "/addon/mode/loadmode.js",
    cmPath + "/addon/mode/multiplex.js",
    cmPath + "/addon/runmode/runmode.js",
    cmPath + "/mode/meta.js",
    cmPath + "/mode/markdown/markdown.js",
    cmPath + "/addon/edit/trailingspace.js",
    cmPath + "/addon/dialog/dialog.js",
    cmPath + "/addon/search/searchcursor.js",
    cmPath + "/addon/search/search.js",
    cmPath + "/addon/scroll/annotatescrollbar.js",
    cmPath + "/addon/scroll/scrollpastend.js",
    cmPath + "/addon/search/matchesonscrollbar.js",
    cmPath + "/addon/display/placeholder.js",
    cmPath + "/addon/edit/closetag.js",
    cmPath + "/addon/fold/foldcode.js",
    cmPath + "/addon/fold/foldgutter.js",
    cmPath + "/addon/fold/indent-fold.js",
    cmPath + "/addon/fold/brace-fold.js",
    cmPath + "/addon/fold/xml-fold.js",
    cmPath + "/addon/fold/markdown-fold.js",
    cmPath + "/addon/fold/comment-fold.js",
    cmPath + "/addon/selection/active-line.js",
    cmPath + "/addon/edit/closebrackets.js",
    cmPath + "/addon/display/fullscreen.js",
    cmPath + "/addon/search/match-highlighter.js"
];

gulp.task("cm-css", function () {

    var csses = [cmPath + "/lib/codemirror.css"];

    return gulp.src(csses)
        .pipe(concat("codemirror.min.css"))
        .pipe(gulp.dest(cmPath))
        .pipe(minifycss({compatibility: 'ie8'}))
        .pipe(gulp.dest(cmPath))
        .pipe(notify({message: "codemirror css task complete!"}));
});

gulp.task("cm-js", function () {

    return gulp.src(cmJsSrcs)
        .pipe(concat("codemirror.min.js"))
        .pipe(gulp.dest(cmPath))
        .pipe(uglify())
        .pipe(gulp.dest(cmPath))
        .pipe(header(headerMiniComment, {
            pkg: pkg, fileName: function (file) {
                var name = file.path.split(file.base + "\\");
                return (name[1] ? name[1] : name[0]).replace(/\\/g, "");
            }
        }))
        .pipe(gulp.dest(cmPath))
        .pipe(notify({message: "codemirror task complete!"}));
});


gulp.task("default", function () {
    gulp.run("css");
    gulp.run("js");
    //gulp.run("cm-css");
    //gulp.run("cm-js");
});

gulp.task("cm", function () {
    gulp.run("cm-css");
    gulp.run("cm-js");
});

gulp.task("all", function () {
    gulp.run("css");
    gulp.run("js");
    gulp.run("cm-css");
    gulp.run("cm-js");
});