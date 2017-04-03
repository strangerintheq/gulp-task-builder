var config = {
    src: './src/',
    dest: './bin/',
    temp: './temp/'
};

var core = {
    gulp: require('gulp'),
    pump: require('pump')
};

var plugins = {
    webpack: require('webpack-stream'),
    concat: require('gulp-concat'),
    concatCss: require('gulp-concat-css'),
    minifyCss: require('gulp-cssnano'),
    htmlMin: require("gulp-htmlmin"),
    rename: require("gulp-rename"),
    webServer: require('gulp-webserver'),
    fileInclude: require('gulp-file-include'),
    removeEmptyLines: require('gulp-remove-empty-lines'),
    stylus: require('gulp-stylus')
};

module.exports = {
    core: core,
    plugins: plugins,
    config: config,
    task: createTaskBuilder
};

function createTaskBuilder(name) {

    if (!name) {
        throw new Error('task must be named');
    }

    var builder = {
        name: name,
        tasks: [],
        dependencies:[]
    };

    builder.pump = function () {
        return core.gulp.task(builder.name, builder.dependencies, function (callback) {
            core.pump(builder.tasks, callback);
        });
    };
    builder.depends = function(dependencies) {
        builder.dependencies = dependencies;
        return builder;
    };
    builder.subTask = function(task) {
        builder.tasks.push(task);
        return builder;
    };
    builder.src = function(path) {
        return builder.subTask(core.gulp.src(srcFromPath(path)));
    };
    builder.temp = function () {
        return builder.subTask(core.gulp.dest(config.temp)).pump();
    };
    builder.dest = function(path) {
        return builder.subTask(core.gulp.dest(path ? path : config.dest)).pump();
    };

    builder.webpack = function(c, uglify) {
        return builder.subTask(plugins.webpack(webpackConfig(c, uglify)));
    };
    builder.concatCss = function(filename) {
        return builder.subTask(plugins.concatCss(filename));
    };
    builder.fileinclude = function () {
        return builder.subTask(plugins.fileinclude());
    };
    builder.stylus = function() {
        return builder.subTask(plugins.stylus());
    };
    builder.removeEmptyLines = function() {
        return builder.subTask(plugins.removeEmptyLines());
    };
    builder.minifyCss = function() {
        return builder.subTask(plugins.minifyCss());
    };
    return builder;
}

function webpackConfig(c, uglify) {

    var cfg = typeof c == "string" ? {
        entry: config.src + c,
        output: {
            filename: c.split("/").pop()
        }
    } : config;

    if (uglify) {
        if (!cfg.plugins) {
            cfg.plugins = [];
        }
        cfg.plugins.push(new plugins.webpack.webpack.optimize.UglifyJsPlugin({ minimize: true }));
    }

    return cfg;
}

function srcFromPath(path) {
    if (typeof path == "string") {
        return config.src + (path || '');
    } else {
        return path.map(function (src) {
            return config.src + src;
        });
    }
}