'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('concatJS', function(){
  gulp.src(['public/js/mongo.js', 'public/js/myclass.js', 'public/js/student-assignment-score.js', 'public/js/rendering.js', 'public/js/editing.js', 'public/js/delete.js'])
  .pipe(concat('app.js'))
  .pipe(gulp.dest('public/js'));
});

gulp.task('minifyJS', function(){
  gulp.src('public/js/app.js')
  .pipe(uglify())
  .pipe(rename('app.min.js'))
  .pipe(gulp.dest('public/js'));

});

gulp.task('default', ['concatJS', 'concatJS']);
