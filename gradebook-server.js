'use strict';
var http = require('http');
var fs = require('fs');
var path = require('path');

// var port = 5000;
// var hostUrl = '127.0.0.1';

function getContentType(req){
  var extname = path.extname(req.url);
  if (extname === '.html'){
    return 'text/html';
  }
  if (extname === '.css') {
    return  'text/css';
  }
  if (extname === '.js') {
    return 'application/javascript';
  }
}

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
    res.writeHead(200, {'Content-Type': getContentType(req)})
    res.end(data, 'utf-8');
  })
})

.listen(process.env.PORT || 5000);



// .listen(port, hostUrl, function() {
  // console.log('server is listening @ ' + hostUrl + ':' + port);
// });


