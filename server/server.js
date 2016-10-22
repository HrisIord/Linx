var express = require('express');
var app = express();
var router = express.Router();
var http = require('http').Server(app);
var url = require('url');

// set the port
var port = 3000;        

// middleware to use for all requests
router.use(function(req, res, next) { next(); });

// home page route
router.get('/', function(req, res) {
  console.log(req);
});

// register routes ------------------------------------------------------------
app.use('/', router);

// RUN EVERYTHING!
http.listen(port, function(){
  console.log('listening on *:' + port);
});
