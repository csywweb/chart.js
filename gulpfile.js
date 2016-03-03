var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')(),
  stylish = require('jshint-stylish');

var gpath = {
  src: "src/",
  styles: "src/styles/",
  scripts: "src/scripts/",
  scss: "src/scss/",
  images: "src/images/",
  dist: "dist"
};

// sass
gulp.task('sass', function() {
  // cancel ruby sass
  // return plugins.rubySass(gpath.scss + 'main.scss', {
  //     style: 'expanded'
  //   })
  //   .on('error', function(err) {
  //     console.error('Err: ', err.message);
  //   })
  return gulp.src(gpath.scss + 'main.scss')
    // .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({
      outputStyle: 'expanded'
    }).on('error', plugins.sass.logError))
    // .pipe(plugins.sourcemaps.write())
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
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.connect.reload());
});

// dist css
gulp.task('dist-css', function() {
  return gulp.src(gpath.styles + '**/*.css')
    // .pipe(plugins.minifyCss())
    .pipe(gulp.dest(gpath.dist + '/styles'));
});

// dist js
gulp.task('dist-js', function() {
  return gulp.src(gpath.scripts + '**/*')
    // .pipe(plugins.concat('common.js'))
    // .pipe(gulp.dest(gpath.dist + '/scripts'))
    // .pipe(plugins.rename({
    //     suffix: '.min'
    // }))
    // .pipe(plugins.uglify())
    .pipe(gulp.dest(gpath.dist + '/scripts'));
});

// dist img
gulp.task('dist-img', function() {
  return gulp.src([gpath.images + '**/*', '!' + gpath.src + '**/*.psd'])
    .pipe(plugins.cache(plugins.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(gpath.dist + '/images'));
});

// dist html
gulp.task('dist-html', function() {
  return gulp.src(gpath.src + '*.htm*')
    .pipe(plugins.htmlmin({
      collapseWhitespace: false,
      removeComments: false,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    }))
    .pipe(gulp.dest(gpath.dist));
});

// clean
gulp.task('clean', function() {
  return gulp.src(gpath.dist, { read: true })
    .pipe(plugins.rimraf());
});

// dist
gulp.task('build', ['clean'], function() {
  gulp.start('dist-css', 'dist-js', 'dist-img', 'dist-html');
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