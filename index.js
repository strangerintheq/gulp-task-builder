var plugins = {
    gulp: require('gulp'),
    pump: require('pump'),
    browserify: require('browserify'),
    source: require('vinyl-source-stream'),
    buffer: require('vinyl-buffer'),
    concat: require('gulp-concat'),
    uglify: require('gulp-uglify'),
    concatCss: require('gulp-concat-css'),
    minifyCss: require('gulp-cssnano'),
    htmlmin: require("gulp-htmlmin"),
    rename: require("gulp-rename"),
    webserver: require('gulp-webserver'),
    fileinclude: require('gulp-file-include'),
    stylus: require('gulp-stylus')
};

function TaskBuilder(name, cfg) {
    if (!name) {
        throw new Error('task must be named');
    }
    this.name = name;
    this.srcUrl = cfg && cfg.src ? cfg.src : './src/';
    this.destUrl = cfg && cfg.dest ? cfg.dest : '.';
    this.tempUrl = cfg && cfg.temp ? cfg.temp :'./temp/';
    this.tasks = [];
    this.dependencies = [];
    this.plugins = plugins;
}

module.exports = TaskBuilder;

TaskBuilder.prototype.src = function(path) {
    this.addTask(plugins.gulp.src(this.srcUrl + (path || '')));
    return this;
};

TaskBuilder.prototype.depends = function(dependencies) {
    this.dependencies = dependencies;
    return this;
};

TaskBuilder.prototype.addTask = function(task) {
    this.tasks.push(task);
    return this;
};

TaskBuilder.prototype.browserify = function(url, filename) {
    this.addTask(plugins.browserify(this.srcUrl + url).bundle());
    return this.addTask(plugins.source(filename));
};

TaskBuilder.prototype.stylus = function() {
    return this.addTask(plugins.stylus());
};

TaskBuilder.prototype.concatCss = function(filename) {
    return this.addTask(plugins.concatCss(filename));
};

TaskBuilder.prototype.fileinclude = function() {
    return this.addTask(plugins.fileinclude());
};

TaskBuilder.prototype.dest = function(url) {
    this.addTask(plugins.gulp.dest(this.destUrl + (url ? url : '')));
    return this.pump();
};

TaskBuilder.prototype.temp = function() {
    this.addTask(plugins.gulp.dest(this.tempUrl));
    return this.pump();
};

TaskBuilder.prototype.serve = function(fallback) {
    this.addTask(plugins.gulp.src('.'));
    this.addTask(plugins.webserver({
        port: 80, fallback: fallback || 'index.html'
    }));
    return this.pump();
};

TaskBuilder.prototype.pump = function(){
    var tasks = this.tasks;
    return plugins.gulp.task(
        this.name,
        this.dependencies,
        function (cb) {
            plugins.pump(tasks, cb);
        }
    );
};
