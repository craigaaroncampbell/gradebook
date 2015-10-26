'use strict';

var http = require('http');

var server = http.createServer(function(req, res){
  res.writeHead(200, {
    'Content-Type' : 'text/plain'
  });

  res.write('test server');
  res.end();
});

server.listen(3000);

var mylog = "I want this text added to the end of the server.js file."

console.log(mylog)
