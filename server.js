var browserify = require('browserify-middleware');
var express = require('express');
var app = express();

app.get('/app.js', browserify(__dirname + '/frontend/app.js'));

app.use('/', express.static(__dirname + '/frontend'));

var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('custom server listening at http://%s:%s', host, port);
});


