/// <reference path="typings/index.d.ts" />
const gulp = require("gulp"),
      gutil = require("gulp-util"),
      rename = require("gulp-rename"),
      debug = require("gulp-debug"),
      plumber = require("gulp-plumber"),
      connect = require("gulp-connect"),
      sass = require("gulp-sass"),
      rimraf = require("rimraf"),
      runSequence = require('run-sequence'),
      guidestyle = require("gulp-guidestyle").default,
      nunjucks = require("gulp-nunjucks-template").default;

const paths = {
  stylesheet: ["styles/{sub,main}.scss"],
  watch: "styles/**/*.scss",
  destination: "www",
  templates: "templates"
}

gulp.task("default",["make"]);
gulp.task("make", ["styleguide"]);

gulp.task("server", cb => {
  connect.server({
      livereload: true,
      port: 3000,
      host: '0.0.0.0',
      root: paths.destination
  })
  cb();
})

gulp.task("styleguide",cb => {
  runSequence("styleguide:json",["styleguide:html","styleguide:css","styleguide:bower"],cb);
});
gulp.task("styleguide:bower", cb => {
  gulp.src([
    "bower_components/jquery/dist/jquery.min.js",
    "bower_components/highlightjs/highlight.pack.min.js"
    ])
    .pipe(plumber())
    .pipe(gulp.dest(paths.destination+"/js"));

  gulp.src([
    "bower_components/highlightjs/styles/github.css"
    ])
    .pipe(plumber())
    .pipe(gulp.dest(paths.destination+"/style/highlightjs"));
  cb();
});
gulp.task("styleguide:css", t => {
  return gulp.src(paths.templates+"/styleguide.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest(paths.destination+"/style"))
    .pipe(connect.reload());
});
gulp.task("styleguide:html", t=> {
  return gulp.src(paths.stylesheet)
    .pipe(plumber())
    .pipe(guidestyle())
    .pipe(gulp.dest(paths.destination))
    .pipe(nunjucks(paths.templates+"/index.html"))
    .pipe(gulp.dest(paths.destination))
    .pipe(connect.reload());
});
gulp.task("styleguide:json", t=> {
  return gulp.src(paths.stylesheet)
    .pipe(plumber())
    .pipe(guidestyle())
    .pipe(gulp.dest(paths.destination));
});
gulp.task("watch", cb => {
  runSequence("make","server","watch:resources","watch:styleguide",cb);
});
gulp.task("watch:styleguide", cb => {
  gulp.watch([paths.templates+"/**/*"], ["styleguide:html","styleguide:css"]);
  gulp.watch(paths.watch,["styleguide:html"]);
  cb();
});
gulp.task("watch:resources", cb => {
  gulp.watch(paths.watch,["resources:css"])
  cb();
});

gulp.task("resources:css", () => {
  return gulp.src(paths.stylesheet)
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest(paths.destination+"/style"));
});

gulp.task("clean", cb => {
  rimraf(paths.destination,cb);
});