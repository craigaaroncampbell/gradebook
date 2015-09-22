'use strict';
var http = require('http');
var fs = require('fs');
var path = require('path');

var port = 5000;
var hostUrl = '127.0.0.1';

var svr = http.createServer(function(req, res){
  var type;
  if (req.url === '/') {
    req.url = '/public/index.html'
  }

  console.log("got a request for url:" + req.url);

  fs.readFile(__dirname + req.url, function(err, data){
    if  (err) {
      res.writeHead(404);
      res.end("404 - we ain't finding no such file!");
    }

    function getContentType(extname){
      if (extname === '.html'){
        type = 'text/html';
      }
      if (extname === '.css') {
        type = 'text/css';
      }
      if (extname === '.js') {
        type = 'application/javascript';
      }
    }

    getContentType(path.extname(req.url));
    res.writeHead(200, {'Content-Type': type})
    console.log("type: ", type);
    res.end(data, 'utf-8');
  })
}).listen(port, hostUrl, function() {
  console.log('server is listening @ ' + hostUrl + ':' + port);
});

