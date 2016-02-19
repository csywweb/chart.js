var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')(),
  del = require('del');

var gpath = {
  src: "src/",
  styles: "src/styles/",
  scripts: "src/scripts/",
  scss: "src/scss/",
  images: "src/images/",
  build: "build"
};

// sass
gulp.task('sass', function() {
  return plugins.rubySass(gpath.scss + 'main.scss', {
      style: 'expanded'
    })
    .on('error', function(err) {
      console.error('Err: ', err.message);
    })
    .pipe(plugins.autoprefixer({
      browsers: ['last 2 versions']
    }))
    // .pipe(plugins.minifyCss())
    .pipe(gulp.dest(gpath.styles))
    .pipe(plugins.connect.reload());
});

// jshint
gulp.task('jshint', function() {
  return gulp.src([gpath.scripts + '**/*.js', '!' + gpath.scripts + '**/*.min.js'])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'))
    .pipe(plugins.connect.reload());
});

// build css
gulp.task('build-css', function() {
  return gulp.src(gpath.styles + '**/*.css')
    // .pipe(plugins.minifyCss())
    .pipe(gulp.dest(gpath.build + '/styles'));
});

// build js
gulp.task('build-js', function() {
  return gulp.src(gpath.scripts + '**/*')
    // .pipe(plugins.concat('common.js'))
    // .pipe(gulp.dest(gpath.build + '/scripts'))
    // .pipe(plugins.rename({
    //     suffix: '.min'
    // }))
    // .pipe(plugins.uglify())
    .pipe(gulp.dest(gpath.build + '/scripts'));
});

// build img
gulp.task('build-img', function() {
  return gulp.src([gpath.images + '**/*', '!' + gpath.src + '**/*.psd'])
    .pipe(plugins.cache(plugins.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(gpath.build + '/images'));
});

// build html
gulp.task('build-html', function() {
  return gulp.src(gpath.src + '*.htm*')
    .pipe(gulp.dest(gpath.build));
});

// clean
gulp.task('clean', function(cb) {
  del(['build/styles', 'build/scripts', 'build/images', 'build/*.htm*'], cb);
});

// build
gulp.task('build', ['clean'], function() {
  gulp.start('build-css', 'build-js', 'build-img', 'build-html');
});

// connect svr
gulp.task('connect', function() {
  plugins.connect.server({
    root: gpath.src,
    port: 8000,
    livereload: true
  });
});

// reload svr
gulp.task('reload', function() {
  return gulp.src(gpath.src + '**/*.*')
    .pipe(plugins.connect.reload());
});

// watch
gulp.task('watch', function() {
  gulp.watch(gpath.src + '**/*.scss', ['sass']);
  gulp.watch([gpath.src + '**/*.js', '!' + gpath.src + '**/*.min.js'], ['jshint']);
  gulp.watch([gpath.src + '*.htm*', gpath.images + '**/*', '!' + gpath.images + '**/*.psd'], ['reload']);
});

// start
gulp.task('default', ['connect', 'watch']);