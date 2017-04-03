var config = {
    src: './',
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
    htmlmin: require("gulp-htmlmin"),
    rename: require("gulp-rename"),
    webserver: require('gulp-webserver'),
    fileinclude: require('gulp-file-include'),
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

    builder.depends = function(dependencies) {
        this.dependencies = dependencies;
        return builder;
    };

    builder.subTask = function(task) {
        builder.tasks.push(task);
        return builder;
    };

    builder.src = function(path) {
        var src;
        if (typeof path == "string") {
            src = config.src + (path || '');
        } else {
            src = path.map(function (src) {
                return config.src + src;
            });
        }
        builder.subTask(core.gulp.src(src));
        return builder;
    };

    builder.webpack = function(config) {
        return builder.subTask(plugins.webpack(typeof config == "string" ? {
            output: {
                filename: config
            }
        } : config));
    };

    builder.source = function(filename) {
        return builder.subTask(plugins.source(filename));
    };

    builder.concatCss = function(filename) {
        return builder.subTask(plugins.concatCss(filename));
    };

    builder.dest = function(path) {
        builder.subTask(core.gulp.dest(path ? path : builder.config.dest));
        return builder.pump();
    };

    builder.serve = function(fallback) {
        builder.subTask(core.gulp.src('.'));
        builder.subTask(plugins.webserver({
            port: 80, fallback: fallback || 'index.html'
        }));
        return builder.pump();
    };

    builder.fileinclude = fileinclude.bind(null, builder);
    builder.stylus = stylus.bind(null, builder);
    builder.temp = temp.bind(null, builder);
    builder.pump = pump.bind(null, builder);

    return builder;
}

function fileinclude(builder) {
    return builder.subTask(plugins.fileinclude());
}

function stylus(builder) {
    return builder.subTask(plugins.stylus());
}

function temp(builder) {
    builder.subTask(core.gulp.dest(builder.config.temp));
    return builder.pump();
}

function pump(builder) {
    return core.gulp.task(
        builder.name,
        builder.dependencies,
        function (cb) {
            core.pump(builder.tasks, cb);
        }
    );
}
