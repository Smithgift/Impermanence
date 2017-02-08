'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var run = require('gulp-run');
var rename = require('gulp-rename');
var gulpMultiProcess = require('gulp-multi-process');
var gls = require('gulp-live-server');

var TestRPC = require('ethereumjs-testrpc');

gulp.task('default', function() {
  return gulpMultiProcess(['testrpc', 'watch']);
});

gulp.task('watch', function() {
  gulp.watch(['contracts/**', 'src/**', 'test/**'], ['mocha']);
});

gulp.task('testrpc', function() {
  var server = TestRPC.server(/*{'logger': console}*/)
  server.listen(8555, function(err, blockchain) {
    if(err) {
      console.log(err);
    }
  });
});

gulp.task('build', function() {
  // There's probably some kind of gulp-sorcery to use the npm version of solc here, instead.
  // It's beyond me at the moment.
  return run('solc contracts/*.sol --combined-json abi,bin').exec()
    .pipe(rename('contracts.json'))
    .pipe(gulp.dest('./build/'));
})

gulp.task('mocha', ['build'], function() {
  return gulp.src(['test/*.js'], { read: false })
    .pipe(mocha({ reporter: 'list' }))
    .on('error', gutil.log);
});

gulp.task('run', ['watch', 'testrpc'], function() {
  var server = gls.new('server.js');
  server.start();
});
