'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var run = require('gulp-run');
var rename = require('gulp-rename');
var gulpMultiProcess = require('gulp-multi-process');
var gls = require('gulp-live-server');

var TestRPC = require('ethereumjs-testrpc');

var Promise = require('bluebird');

gulp.task('default', function() {
  return gulpMultiProcess(['testrpc', 'watch-build', 'watch-mocha']);
});

gulp.task('watch-build', function() {
  gulp.watch(['contracts/**'], ['build']);
})

gulp.task('watch-mocha', function() {
  gulp.watch(['build/**', 'src/**', 'test/**'], ['mocha']);
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

gulp.task('mocha', function() {
  return gulp.src(['test/*.js'], { read: false })
    .pipe(mocha({ reporter: 'list' }))
    .on('error', gutil.log);
});

var galaxy;

gulp.task('deploy', ['build', 'testrpc'], function() {
  var Web3 = require('web3');
  var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8555'));
  Promise.promisifyAll(web3.eth);
  var u = require('./src/universe')(web3);
  return web3.eth.getAccountsAsync()
    .then(a => web3.eth.defaultAccount = a[0])
    .then(u.createUniverse)
    .then(_galaxy => galaxy = _galaxy)
    .then(_galaxy => console.log("galaxy deployed at:", _galaxy.address));
});

gulp.task('run', ['deploy', 'testrpc'], function() {
  var server = gls.new('server.js');
  server.start();
});
