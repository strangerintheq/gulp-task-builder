'use strict';

var plugins = {
    webpack: require('webpack-stream'),
    concatCss: require('gulp-concat-css'),
    minifyCss: require('gulp-cssnano'),
    removeEmptyLines: require('gulp-remove-empty-lines'),
    stylus: require('gulp-stylus'),
    fileInclude: require('gulp-file-include'),
    concat: require('gulp-concat'),
    htmlMin: require("gulp-htmlmin"),
    rename: require("gulp-rename"),
    webServer: require('gulp-webserver')
};

module.exports = plugins;

plugins.extend = function(builder) {

     builder.webpack = function(c, uglify) {
         return builder.subTask(plugins.webpack(webpackConfig(c, uglify, builder)));
     };

     for (var plugin in plugins) {
         if (plugins.hasOwnProperty(plugin) && plugin !== 'webpack') {
             var func = plugins[plugin];
             builder[plugin] = function (settings) {
                 return builder.subTask(func(settings));
             }
         }
     }

     return builder;
};

function webpackConfig(c, uglify, builder) {

    var cfg = typeof c === "string" ? {
        entry: builder.config.src + c,
        output: {
            filename: c.split("/").pop()
        }
    } : builder.config;

    if (uglify) {
        if (!cfg.plugins) {
            cfg.plugins = [];
        }
        cfg.plugins.push(new plugins.webpack.webpack.optimize.UglifyJsPlugin({
            minimize: true
        }));
    }

    return cfg;
}