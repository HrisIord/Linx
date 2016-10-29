var express     = require('express');
var bodyParser  = require('body-parser');
var url         = require('url');

var app     = express();
var router  = express.Router();
var http    = require('http').Server(app);

const dbPath = "mongodb://127.0.0.1:27017/linxdb";
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

// set the port
var port = 3000;        

// middleware to use for all requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
router.use(function(req, res, next) { next(); });


// path stuff -----------------------------------------------------------------
router.get('/', function(req, res) {
	MongoClient.connect(dbPath, function(err, db) {
    if (err) { return console.dir(err); }

    db.collection('links').find().toArray(function (err, result) {
      if (err) { return console.log(err); }

      console.log(result);
      res.send(result);
      db.close();
    });
  });
});

router.post('/', function(req, res) {
	MongoClient.connect(dbPath, function(err, db) {
    if (err) { return console.log(err); }

    db.collection('links').insert({ url: req.body.url }, function (err, result) {      
      if (err) { return console.log(err); }

      console.log(req.body);
      res.send(req.body);
      db.close();
    });
  });
});

// register routes ------------------------------------------------------------
app.use('/', router);

// RUN EVERYTHING!
http.listen(port, function() {
  console.log('listening on *:' + port);
});
