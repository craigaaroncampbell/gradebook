'use strict';
var http = require('http');
var fs = require('fs');
var path = require('path');

var port = 5000;
var hostUrl = '127.0.0.1';

var svr = http.createServer(function(req, res){
  if (req.url === '/') {
    req.url = '/public/index.html'
  }

  console.log("got a request for url:" + req.url);

  fs.readFile(__dirname + req.url, function(err, data){
    if  (err) {
      res.writeHead(404);
      res.end("404 - we ain't finding no such file!");
    }
    if (path.extname(req.url) === '.html') {
      res.writeHead(200, {'Content-Type': 'text/html'})
    }
    if (path.extname(req.url) === '.js') {
      res.writeHead(200, {'Content-Type': 'application/javascript'})
    }
    if (path.extname(req.url) === '.css') {
      res.writeHead(200, {'Content-Type': 'text/css'})
    }
    res.end(data, 'utf-8');
  })
}).listen(port, hostUrl, function() {
  console.log('server is listening @ ' + hostUrl + ':' + port);
});

