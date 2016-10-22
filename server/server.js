var express     = require('express');
var bodyParser  = require('body-parser')
var url         = require('url');

var app     = express();
var router  = express.Router();
var http    = require('http').Server(app);


// set the port
var port = 3000;        

// middleware to use for all requests
app.use(express.bodyParser());
router.use(function(req, res, next) { next(); });

// home page route
router.get('/', function(req, res) {
  console.log(req.body);
  res.send('hello world');
});

// home page route
router.post('/', function(req, res) {
  console.log(req.body);
  res.send(req.body);
});

// register routes ------------------------------------------------------------
app.use('/', router);

// RUN EVERYTHING!
http.listen(port, function(){
  console.log('listening on *:' + port);
});
