/*jslint nomen: true, node:true*/
/*global require*/
'use strict';
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    clean = require('gulp-clean'),
    runSequence = require('run-sequence'),
    paths = require('./gulp_config.json'),
    content = require('./content.json'),
    run = require('gulp-run'),
    clone = require('gulp-clone'),
    assetpaths = require('gulp-assetpaths'),
    raster = require('gulp-raster'),
    rename = require('gulp-rename'),
    flatmap = require('gulp-flatmap'),
    browserSync = require('browser-sync').create(),
    Handlebars = require('gulp-compile-handlebars'),
    HandlebarsLayouts = require('handlebars-layouts'),
    prettify = require('gulp-prettify'),
    prettifyJs = require('gulp-js-prettify'),
    stripDebug = require('gulp-strip-debug'),
    sourcemaps = require('gulp-sourcemaps'),
    templateCache = require('gulp-angular-templatecache'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),

    path = require('path'),
    _ = require('lodash'),
    fs = require("fs"),
    inject = require('gulp-inject-string'),
    displayError = function(error) {
        var errorString = '[' + error.plugin + ']';
        errorString += ' ' + error.message.replace("\n", '');
        if (error.fileName) {
            errorString += ' in ' + error.fileName;
        }
        if (error.lineNumber) {
            errorString += ' on line ' + error.lineNumber;
        }
        console.error(errorString);
    };


    var polyfill = './node_modules/babel-polyfill/dist/polyfill.min.js';
    // var polyfill = './node_modules/babel-polyfill/dist/polyfill.js';

require('./utils/handlebars-helpers');

var processors = [
    autoprefixer({ browsers: ['last 3 version'] }),

]

// RUNNERS ////////////////////////////////////////////////////////////////////////

gulp.task('build', function() {
    runSequence(
        'sass',
        'jshint',
        'template-cache',
        'concat-js-vendor',
        'concat-js-components',
        'concat-js-common',
        'concat-js-all',
        'concat-js-head',
        'clean-components',
        'update-asset-paths',
        'clean-layouts',
        'layouts',
        'clean-images',
        'images',
        'fonts',
        'png-generate',
        'metalsmith-build'
    );
});


gulp.task('aem', function() {
    runSequence(
        'aem-js',
        'aem-css',
        'aem-html',
        'aem-js-global',
        'aem-css-global',
        'aem-js-vendor',
        'aem-js-head'
    );
});



gulp.task('watch', function() {
    runSequence(
        'sass',
        'jshint',
        'template-cache',
        'concat-js-vendor',
        'concat-js-components',
        'concat-js-common',
        'concat-js-all',
        'concat-js-head',
        'clean-components',
        'update-asset-paths',
        'clean-layouts',
        'layouts',
        'clean-images',
        'images',
        'fonts',
        'metalsmith-build',
        'browser-sync',
        'watcher-angular-templates',
        'watcher-js',
        'watcher-scss',
        'watcher-templates',
        'reload-watcher-scss',
        'reload-watcher-js',
        'reload-watcher-templates'
    );
});






// AEM  Build ////////////////////////////////////////////////////////////////////


var components = 'source/components';

function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}


gulp.task('aem-js', function() {

    var folders = getFolders(components),
        tasks = folders.map(function(folder) {

            if (folder !== 'global') {

                return gulp.src(path.join(components, folder, '/**/*.js'))
                    .pipe(stripDebug())
                    .pipe(prettifyJs({
                        indent_size: 4
                    }))
                    .pipe(gulp.dest('./source/aem-styles/components/' + folder));

            }
        });

    return tasks;
});


gulp.task('aem-js-global', function() {
    console.log(paths.gulp.js_common);
    var globalPaths = paths.gulp.js_common.files,
        stream;

    globalPaths.push('./source/components/global/**/*.js');
    // globalPaths.unshift(polyfill);

    stream = gulp.src(globalPaths)
        .pipe(concat('global-js.js'))
        .pipe(stripDebug())
        .pipe(prettifyJs({
            indent_size: 4
        }))
        .pipe(gulp.dest('./source/aem-styles/global'));
    return stream;
});

gulp.task('aem-js-vendor', function() {

    _.each(paths.gulp.vendor.files, function(item) {

        var stream = gulp.src(item)
            .pipe(gulp.dest('./source/aem-styles/vendor/'));
        return stream;


    });



});

gulp.task('aem-js-head', function() {

    _.each(paths.gulp.head.files, function(item) {
        var stream = gulp.src(item)
            .pipe(gulp.dest('./source/aem-styles/head/'));
        return stream;


    });



});

gulp.task('aem-html', function() {

    var folders = getFolders(components),
        tasks = folders.map(function(folder) {

            if (folder !== 'global') {
                var filePath = './source/components/' + folder + '/' + folder + '.hbs';
                if (fs.existsSync(filePath)) {
                    var options = {
                        ignorePartials: false,
                        batch: ['./source/components'],
                        /*helpers: {
                            'math': math,
                            'ifCondNot': ifCondNot,
                            'ifCond': ifCond,
                            'ifAnd': ifAnd,
                            'partial': partial,
                            'ternaryVar': ternaryVar
                        }*/
                    };
                    var data = {
                        content: content
                    };
                    return gulp.src('./source/components/' + folder + '/' + folder + '.hbs')
                        .pipe(Handlebars(data, options))
                        .pipe(rename(folder + '.html'))
                        .pipe(prettify({
                            indent_size: 4
                        }))
                        .pipe(assetpaths({
                            newDomain: '/etc/designs/dotcom',
                            oldDomain: '/assets',
                            docRoot: '/common',
                            filetypes: ['jpg', 'jpeg', 'png', 'svg', 'ico', 'gif', 'eot', 'woff', 'ttf'],
                            templates: true
                        }))
                        .pipe(gulp.dest('./source/aem-styles/components/' + folder));
                } else {
                    var innerFolders = getFolders(components + '/' + folder);
                    innerFolders.map(function(innerFolder) {
                        var options = {
                            ignorePartials: true,
                            batch: ['./source/components'],
                            /*helpers: {
                                'math': math,
                                'ifCondNot': ifCondNot,
                                'ifCond': ifCond,
                                'ifAnd': ifAnd,
                                'partial': partial,
                                'ternaryVar': ternaryVar

                            }*/

                        };

                        var data = {
                            content: content
                        };

                        return gulp.src('./source/components/' + folder + '/' + innerFolder + '/' + innerFolder + '.hbs')
                            .pipe(Handlebars(data, options))
                            .pipe(rename(innerFolder + '.html'))
                            .pipe(prettify({
                                indent_size: 4
                            }))
                            .pipe(assetpaths({
                                newDomain: '/etc/designs/dotcom',
                                oldDomain: '/assets',
                                docRoot: '/common',
                                filetypes: ['jpg', 'jpeg', 'png', 'svg', 'ico', 'gif', 'eot', 'woff', 'ttf'],
                                templates: true
                            }))
                            .pipe(gulp.dest('./source/aem-styles/components/' + folder + '/' + innerFolder));

                    });
                }
            }
        });

    return tasks;
});



gulp.task('aem-css', function() {

    var folders = getFolders(components),
        tasks = folders.map(function(folder) {

            if (folder !== 'global') {

                var location = '../../components/' + folder + '/' + folder;
                var filePath = './source/components/' + folder + '/' + folder + '.scss';

                if (fs.existsSync(filePath)) {

                    return gulp.src('./source/common/styles/aem.scss')
                        // concat into foldername.js
                        .pipe(inject.replace('--component--', location))
                        .pipe(sass({
                            outputStyle: 'compressed'
                        }))
                        .pipe(postcss(processors))
                        .pipe(assetpaths({
                            newDomain: '/etc/designs/dotcom',
                            oldDomain: '/assets',
                            docRoot: '/common',
                            filetypes: ['jpg', 'jpeg', 'png', 'ico', 'svg', 'gif', 'eot', 'woff', 'ttf'],
                            templates: true
                        }))
                        .pipe(rename(folder + '.css'))
                        .pipe(gulp.dest('./source/aem-styles/components/' + folder));
                } else {

                    var innerFolders = getFolders(components + '/' + folder);

                    innerFolders.map(function(innerFolder) {

                        var location = '../../components/' + folder + '/' + innerFolder + '/' + innerFolder;
                        var filePath = './source/components/' + folder + '/' + innerFolder + '/' + innerFolder + '.scss';

                        if (fs.existsSync(filePath)) {

                            return gulp.src('./source/common/styles/aem.scss')
                                // concat into foldername.js
                                .pipe(inject.replace('--component--', location))
                                .pipe(sass({
                                    outputStyle: 'compressed'
                                }))
                                .pipe(postcss(processors))
                                .pipe(assetpaths({
                                    newDomain: '/etc/designs/dotcom',
                                    oldDomain: '/assets',
                                    docRoot: '/common',
                                    filetypes: ['jpg', 'jpeg', 'png', 'svg', 'ico', 'gif', 'eot', 'woff', 'ttf'],
                                    templates: true
                                }))
                                .pipe(rename(innerFolder + '.css'))
                                .pipe(gulp.dest('./source/aem-styles/components/' + folder + '/' + innerFolder));

                        }

                    });

                }

            }
        });

    return tasks;

});





// var fileArray = [];
// gulp.task('aem-css-concat', function() {
//     var stream = gulp.src(['./source/components/**/*.scss', '!./source/components/**/print.scss'])
//         .pipe(flatmap(function(stream, file) {

//             fileArray.push('./source/common/styles/' + path.basename(file.path));

//             gulp.src(['./source/common/styles/aem.scss', file.path])
//                 .pipe(concat(path.basename(file.path)))
//                 .pipe(gulp.dest('./source/common/styles'));

//             return stream;

//         }))

//     return stream;
// });

// gulp.task('aem-css-sass', function() {
//     var stream = gulp.src(fileArray)
//         .pipe(flatmap(function(stream, file) {



//             gulp.src(file.path)
//                 .pipe(sass({
//                     sourceComments: 'map',
//                     sourceMap: 'sass',
//                     outputStyle: 'expanded'
//                 }))
//                 .pipe(gulp.dest('./source/aem-styles/components'));
//             console.log(path.basename(file.path));
//             return stream;

//         }))

//     return stream;
// });
gulp.task('aem-css-global', function() {

    var globalFolders = getFolders(components + '/global'),
        imports = '',
        endOfLine = require('os').EOL;

    _.each(globalFolders, function(item) {

        var filePath = './source/components/global/' + item + '/' + item + '.scss';

        if (fs.existsSync(filePath)) {
            imports += '@import "../../components/global/' + item + '/' + item + '";' + endOfLine;
        }
    });

    console.log(imports);

    var stream = gulp.src(['./source/common/styles/aem-global.scss'])
        .pipe(inject.replace('--imports--', imports))
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(postcss(processors))
        .pipe(assetpaths({
            newDomain: '/etc/designs/dotcom',
            oldDomain: '/assets',
            docRoot: '/common',
            filetypes: ['jpg', 'jpeg', 'png', 'svg', 'ico', 'gif', 'eot', 'woff', 'ttf'],
            templates: true
        }))
        .pipe(gulp.dest('./source/aem-styles/global'));
    return stream;

});

gulp.task('sass_mix', function() {
    var stream = gulp.src([paths.gulp.styles_common.files, paths.gulp.styles_common.components])
        .pipe(concat('mix.scss'))
        .pipe(gulp.dest(paths.gulp.styles_components.dest));
    return stream;
});

gulp.task('aem-css-all', function() {
    var stream = gulp.src(paths.gulp.styles_common.mix)
        .pipe(sass({
            sourceMap: 'sass',
            outputStyle: 'compressed'
        }))
        .pipe(assetpaths({
            newDomain: '/etc/designs/dotcom',
            oldDomain: '/assets',
            docRoot: '/common',
            filetypes: ['jpg', 'jpeg', 'png', 'ico', 'gif', 'eot', 'woff', 'ttf'],
            templates: true
        }))
        .on('error', function(err) {
            displayError(err);
        })
        .pipe(concat('style.css'))
        .pipe(gulp.dest('./source/aem-styles/all'));

    return stream;
});

gulp.task('aem-clean-temp-scss', function() {
    var stream = gulp.src(fileArray, {
            read: false
        })
        .pipe(clean({
            force: true
        }));
    return stream;
});



// watch ////////////////////////////////////////////////////////////////////////

gulp.task('watching', function() {
    runSequence(
        'sass',
        'jshint',
        'concat-js-vendor',
        'concat-js-components',
        'concat-js-common',
        'concat-js-all',
        'update-asset-paths',
        'layouts',
        'images',
        'metalsmith-build'

    );
});

gulp.task('watching-scss', function() {
    console.log('watching-scss');
    runSequence(
        'sass'

    );
});

gulp.task('watching-templates', function() {
    console.log('watching-templates');
    runSequence(
        'update-asset-paths',
        'layouts',
        'images',
        'metalsmith-build'

    );
});

gulp.task('watching-js', function() {
    console.log('watching-js');
    runSequence(
        'jshint',
        'concat-js-vendor',
        'concat-js-components',
        'concat-js-common',
        'concat-js-all'
    );
});


/*
 * TODO - explaination of this
 */
gulp.task('watcher-js', function() {
    gulp.watch(paths.gulp.watch_js, ['watching-js']);
});

gulp.task('watcher-templates', function() {
    gulp.watch(paths.gulp.watch_templates, ['watching-templates']);
});

gulp.task('watcher-scss', function() {
    gulp.watch(paths.gulp.watch_scss, ['watching-scss']);
});

gulp.task('watcher-angular-templates', function() {
    // gulp.watch(paths.gulp.watch_angular_templates, ['template-cache', 'watching-js', 'watching-templates']);
    gulp.watch(paths.gulp.watch_angular_templates, ['template-cache', 'watching-js']);
});


// BUILD ////////////////////////////////////////////////////////////////////////

gulp.task('reload-watcher-scss', function() {
    var stream = gulp.watch("./metalsmith/build/assets/css/*").on("change", function() {
        browserSync.reload("assets/css/*.css");
    });
    return stream;

});

gulp.task('reload-watcher-js', function() {
    var stream = gulp.watch("./metalsmith/build/assets/js/*").on("change", function() {
        browserSync.reload("assets/js/*.js");
    });
    return stream;

});

gulp.task('reload-watcher-templates', function() {
    var stream = gulp.watch("./metalsmith/build/**/*.html").on("change", function() {
        browserSync.reload();
    });
    return stream;

});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./metalsmith/build",
            // https: true // add this back in for market-data to work, only CORS origin https://localhost:3000 was allowed by Nevern
        }
    });
});

// metalsmith build tasks ////////////////////////////////////////////////////////////////////////


/*
 * TODO - explaination of this
 */
gulp.task('metalsmith-build', function() {
    gulp.src('metalsmith.js') // Get input files.
        .pipe(run('node metalsmith')); // Use awk to extract the even lines.
});

// FONTS ////////////////////////////////////////////////////////////////////////

gulp.task('fonts', function() {
    var stream = gulp.src(paths.gulp.fonts.files)
        .pipe(gulp.dest(paths.gulp.fonts.dest));
    return stream;
});

// IMAGES ////////////////////////////////////////////////////////////////////////

/*
 * TODO - explaination of this
 */
gulp.task('images', function() {
    var stream = gulp.src(paths.gulp.images.files)
        .pipe(gulp.dest(paths.gulp.images.dest));
    return stream;
});

/*
 * TODO - explaination of this
 */
gulp.task('clean-images', function() {
    var stream = gulp.src(paths.gulp.images.dest + "/*", {
            read: false
        })
        .pipe(clean({
            force: true
        }));
    return stream;
});

/*
 * Generate PNG fallbacks from SVG files
 */
gulp.task('png-generate', function() {
    gulp.src('./source/common/images/icons/svg/*.svg')
        .pipe(raster({
            format: 'png'
        }))
        .pipe(rename({
            extname: '.png'
        }))
        .pipe(gulp.dest('./source/common/images/icons/png'));
});

// SASS ////////////////////////////////////////////////////////////////////////

gulp.task('sass', function() {


    var imports = '',
        endOfLine = require('os').EOL;



    var folders = getFolders(components),
        tasks = folders.map(function(folder) {

            var location = '"../../components/' + folder + '/' + folder + '";' + endOfLine;
            var filePath = './source/components/' + folder + '/' + folder + '.scss';

            if (fs.existsSync(filePath)) {

                imports += '@import ' + location;
            } else {

                var innerFolders = getFolders(components + '/' + folder);

                innerFolders.map(function(innerFolder) {

                    var location = '"../../components/' + folder + '/' + innerFolder + '/' + innerFolder + '";' + endOfLine;
                    var filePath = './source/components/' + folder + '/' + innerFolder + '/' + innerFolder + '.scss';


                    if (fs.existsSync(filePath)) {

                        imports += '@import ' + location;
                    }

                });

            }



        });

    var stream = gulp.src([
            './source/common/styles/style.scss',
            './source/common/styles/style-override.scss',
            './source/common/styles/pl-style.scss'
        ])
        .pipe(inject.replace('--imports--', imports))
        .pipe(sourcemaps.init())
        .pipe(sass({
            sourceComments: 'map',
            sourceMap: 'sass',
            outputStyle: 'expanded'

        }).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('./map'))
        /*.pipe(assetpaths({
            newDomain: '../',
            oldDomain: '/common',
            docRoot: '',
            filetypes: ['jpg', 'jpeg', 'png', 'ico', 'gif'],
            templates: true
        }))
        .pipe(assetpaths({
            newDomain: '../fonts',
            oldDomain: '/assets/fonts',
            docRoot: '/common',
            filetypes: ['eot', 'woff', 'ttf'],
            templates: true
        }))*/
        .pipe(gulp.dest(paths.gulp.styles_common.dest));

    return stream;

});


// js ////////////////////////////////////////////////////////////////////////

gulp.task('jshint', function() {
    var stream = gulp.src(paths.gulp.js_components.files)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
    return stream;
});

gulp.task('concat-js-components', function() {
    var stream = gulp.src(paths.gulp.js_components.files)
        .pipe(concat('components.js'))
        .pipe(gulp.dest(paths.gulp.js_components.dest, {
            overwrite: true
        }));
    return stream;
});

gulp.task('concat-js-vendor', function() {
    var stream = gulp.src(paths.gulp.vendor.files)
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(paths.gulp.vendor.dest, {
            overwrite: true
        }));
    return stream;
});

gulp.task('template-cache', function() {
    var stream = gulp.src('source/common/js/angular/templates/**/*.html')
        .pipe(templateCache({ 'module': 'investec' }))
        .pipe(gulp.dest('source/common/js/angular/'));
    return stream;
});


gulp.task('concat-js-head', function() {
    var stream = gulp.src(paths.gulp.head.files)
        .pipe(concat('head.js'))
        .pipe(gulp.dest(paths.gulp.head.dest, {
            overwrite: true
        }));
    return stream;
});
gulp.task('concat-js-common', function() {
    var stream = gulp.src(paths.gulp.js_common.files)
        .pipe(concat('common.js'))
        .pipe(gulp.dest(paths.gulp.js_common.dest, {
            overwrite: true
        }));
    return stream;
});

gulp.task('concat-js-all', function() {
    var stream = gulp.src([
            polyfill,
            './metalsmith/js/vendor.js',
            './metalsmith/js/common.js',
            './metalsmith/js/components.js',
            './source/common/js/init.js'
        ])
        .pipe(concat('main-min.js'))
        //test for minify
        .pipe(gutil.env.type === 'production' ? uglify({ mangle: false }) : gutil.noop())
        .pipe(sourcemaps.write())
        //test for minify end
        .pipe(gulp.dest('./metalsmith/build/assets/js', {
            overwrite: true
        }));
    return stream;
});

// components ////////////////////////////////////////////////////////////////////////

gulp.task('clean-components', function() {
    var stream = gulp.src(paths.gulp.components.dest + '/*', {
            read: false
        })
        .pipe(clean({
            force: true
        }));
    return stream;
});

/**
 * updates asset paths in handlebars partials
 * and moves partials to metalsmith/components
 * Instad of updating asset paths with gulp I've added the rootPath plugin
 * to metalsmith which adds the currently level to each file representation when rendered
 * assets are then referenced in the handlebars template using {{rootPath}}assets/css/etc.
 * This potentially has implications for the aem build - Lewis to confirm
 */
gulp.task('update-asset-paths', function() {
    gulp.src(paths.gulp.components.files)
        //.pipe(assetpaths({
        //    newDomain: '../assets',
        //    oldDomain: '/common',
        //   docRoot: '/common',
        //    filetypes: ['jpg', 'jpeg', 'ico', 'gif', 'svg', 'json'],
        /**
         * If this option is false, only paths to filetypes that are explicitly in the filetypes array will be replaced.
         * We don't want to rewrite js or css paths, they are handled by metalsmith
         * @type {Boolean}
         */
        //    templates: false
        //}))
        .pipe(gulp.dest(paths.gulp.components.dest));
});

// layouts ////////////////////////////////////////////////////////////////////////

/**
 * empties metalsmith layouts folder
 */
gulp.task('clean-layouts', function() {
    var stream = gulp.src([
            paths.gulp.layouts.dest + '/*',
            '!' + paths.gulp.layouts.dest + '/non-aem'
        ], {
            read: false
        })
        .pipe(clean({
            force: true
        }));
    return stream;
});

/**
 * moves layout files from src to metalsmith folder
 */
gulp.task('layouts', function() {
    gulp.src(paths.gulp.layouts.files)
        .pipe(gulp.dest(paths.gulp.layouts.dest));
});
