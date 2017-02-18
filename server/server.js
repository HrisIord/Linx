var express     = require('express');
var session     = require('express-session');
var bodyParser  = require('body-parser');
var url         = require('url');
var fs          = require('fs');
var http        = require('http');
var https       = require('https');

var app     = express();
var router  = express.Router();
//var http    = require('http').Server(app);

// User Authentication
var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy
  , LocalStrategy = require('passport-local').Strategy;

// Constants
const TWITTER_CONSUMER_KEY = process.env['TWITTER_CONSUMER_KEY'];
const TWITTER_CONSUMER_SECRET = process.env['TWITTER_CONSUMER_SECRET'];
const TWITTER_CALLBACK_URL = "http://localhost:8443/auth/twitter/callback";
const SESSION_SECRET = 'keyboard cat';

const dbPath = "mongodb://127.0.0.1:27017/linxdb";
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

var privateKey  = fs.readFileSync('certificate/server.key', 'utf8');
var certificate = fs.readFileSync('certificate/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

// set the port
var httpPort = 8080;
var httpsPort = 8443;

var userModel = require('./userModel')();
var repoModel = require('./repoModel')();
var validate = require('./validator');

// --------------------------------- HELPERS ----------------------------------
// checks ig an object is empty
function isEmpty(obj) {
  if (obj == null || obj == undefined)
    return true;
  if (Object.keys(obj).length == 0) 
    return true;
  return false;
}

// ----------------------------- MIDDLEWARE INIT ------------------------------

// middleware to use for all requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
router.use(function(req, res, next) { next(); });

// Enable sessions
// TODO: switch to connect-mongo or connect-mongodb-session eventually
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Set up Passport
app.use(passport.initialize());
app.use(passport.session());

// ----------------------------- AUTHENTICATION -------------------------------

// User Serialization
passport.serializeUser(function(user, done) {
  done(null, user['_id']);
});

passport.deserializeUser(function(id, done) {
  userModel.select(id, function(err, user) {
    if (err) {
      return req.logout();
    }
    done(err, user);
  });
});

// Set up Passport Twitter Authentication
passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: TWITTER_CALLBACK_URL
  },
  function(token, tokenSecret, profile, done) {
    // TODO: Ask for email address on a callback page or something
    userModel.insertOrSelectUserFromTwitterID(profile.id, {username: profile.username, email: profile.username + "@twitter.com"}, 
      function(err, user) {
        // Send result to next (serialization)
        return done(null, user);
      });
  }
));

app.get('/auth/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

// Set up Passport Local Authentication
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
},
  function(username, password, done) {
    userModel.authenticate(username, password, function(err, user){
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user);
    });
  }
));


// -------------------------- ROUTES FOR REST API -----------------------------

// --------------------------- USERS CONTROLLER -------------------------------
router.route('/login')
  .post(function (req, res, next) {
    var errors = validate.login(req.body);
    if (errors.length != 0) {
      res.status(200).json({'error': errors});
      return;
    }

    passport.authenticate('local', function (err, user, info) {
      if (err) { 
        console.log('[error] authenticate callback - ');
        console.log(err);
        res.status(200).json({'error': [err]});
        return;
      }
      if (!user) { 
        console.log('[error] authenticate callback - User not found');
        res.status(200).json({'error': 'User not found.'});
        return;
      }

      // authentication successful, log user in 
      req.logIn(user, function (err) {
        if (err) { 
          console.log('[error] login callback - ');
          console.log(err);
          res.status(500).json({'error': err.errmsg});
          return;
        }

        res.status(200).json({ 'error': null });
      });
    })(req, res, next);
  });

router.route('/register')
  .post(function (req, res) {
    var errors = validate.register(req.body);
    if (errors.length != 0) {
      res.status(200).json({ 'error': errors });
      return;
    }

    userModel.insert(req.body.username, req.body.password, req.body.email, function (err, result) {
      if (err) { 
        console.log('[error] register callback - ');
        console.log(err);
        // convert error object to user readable string
        var errorMsg;
        var status;
        if (err.errmsg.indexOf("$username") >= 0) {
          errorMsg = "This username is taken";
          status = 200;
        } else if (err.errmsg.indexOf("$email") >= 0) {
          errorMsg = "This email is in use";
          status = 200;
        } else {
          errorMsg = err.errmsg;
          status = 500;
        }

        res.status(status).json({ 'error': [errorMsg] });
        return;
      }

      // create default repo for user
      var userId = result.insertedIds[0];
      repoModel.insert(userId, req.body.username + "'s Default Repo", function (err, result) {
        if (err) {
          console.log('[error] register callback - create repo callback -');
          console.log(err);
          res.status(500).json({ 'error': [err.errmsg] });
          return;
        }

        //  get user from db
        userModel.select(userId, function (err, user) {
          if (err) {
            console.log('[error] register callback - get user callback -');
            console.log(err);
            res.status(500).json({ 'error': [err.errmsg] });
            return;
          }

          // log in user
          req.logIn(user, function (err) {
            if (err) { 
              console.log('[error] register callback - login callback -');
              console.log(err);
              res.status(500).json({ 'error': [err.errmsg] });
              return;
            }

            res.status(200).json({ 'error': null });
          });
        });
      });      
    });
  });

router.route('/logout')
  .get(function (req, res) {
    req.logout();
    res.status(200).json({'error': null});
  });

router.route('/profile')
  .get(function(req, res) {
    // check if a user is signed in
    if (isEmpty(req.session.passport) || isEmpty(req.session.passport.user)) {
      res.status(401).json({'error': 'There is no logged in user.'});
      return;
    }

    //  get user from db
    userModel.select(req.session.passport.user, function (err, user) {
      if (err) {
        console.log('[error] profile callback - ');
        console.log(err);
        res.status(500).json({ 'error': err.errmsg });
        return;
      }

      res.status(200).json({
        'user': user,
        'error': null
      });
    });
  });


// --------------------------- REPOS CONTROLLER -------------------------------

router.param('repoId', function(req, res, next, id) {
  req.repoId = (/^[0-9a-fA-F]{24}$/).test(id) ? id : -1;
  next();
});

router.route('/repos/new')
  .post(function(req, res) {
    // check if a user is signed in
    if (isEmpty(req.session.passport) || isEmpty(req.session.passport.user)) {
      res.status(401).json({'error': 'There is no logged in user.'});
      return;
    }

    repoModel.insert(req.session.passport.user, req.body.name, function (err, repo) {
      if (err) {
        console.log('[error] new repo callback -');
        console.log(err);
        res.status(500).json({ 'error': [err.errmsg] });
        return;
      }

      res.status(200).json({
        'repo': repo,
        'error': null
      });
    });
  });

router.route('/repos')
  .get(function(req, res) {
    // check if a user is signed in
    if (isEmpty(req.session.passport) || isEmpty(req.session.passport.user)) {
      res.status(401).json({'error': 'There is no logged in user.'});
      return;
    }

    //  get user from db
    userModel.selectRepos(req.session.passport.user, function (err, repos) { 
      if (err) {
        console.log('[error] repo index callback - ');
        console.log(err);
        res.status(500).json({'error': err.errmsg});
        return;
      }

      res.status(200).json({
        'repos': repos,
        'error': null
      });
    });
  });

router.route('/repos/:repoId')
  .get(function(req, res) {
    // check if a user is signed in
    if (isEmpty(req.session.passport) || isEmpty(req.session.passport.user)) {
      res.status(401).json({'error': 'There is no logged in user.'});
      return;
    } else if (req.repoId == -1) {
      res.status(401).json({'error': 'No such repo.'});
      return;
    }

    repoModel.select(req.repoId, function (err, repo) {
      if (err) {
        console.log('[error] repo show callback - ');
        console.log(err);
        res.status(500).json({'error': err.errmsg});
        return;
      }

      res.status(200).json({
        'repo': repo,
        'error': null
      });
    });

  });

router.route('/repos/:repoId/links/new')
  .post(function(req, res) {
    // check if a user is signed in
    if (isEmpty(req.session.passport) || isEmpty(req.session.passport.user)) {
      res.status(401).json({'error': 'There is no logged in user.'});
      return;
    } else if (req.repoId == -1) {
      res.status(401).json({'error': 'No such repo.'});
      return;
    }

    repoModel.insertLink(req.repoId, req.body, req.session.passport.user, function (err, result) {
      //TODO: figure out how to send good message when repo doesn't exist
      if (err) { 
        console.log('[error] link new callback - ');
        console.log(err);
        res.status(500).json({ 'error': [err.errmsg] });
        return;
      }

      res.status(200).json({ 'error': null });
    });
  });

// ----------------------------------------------------------------------------

router.get('/', function(req, res) {
	MongoClient.connect(dbPath, function(err, db) {
    if (err) { return console.dir(err); }

    db.collection('links').find().toArray(function(err, result) {
      if (err) { return console.log(err); }

      console.log(result);
      res.json(result);
      db.close();
    });
  });
});

router.post('/', function(req, res) {

  var parsed_url = url.parse(req.url, true);
  var query = parsed_url.query;
  console.log(query);

  if (query.ext === 'true') {
    console.log('from ext');
    insertLink(query.url, function() {
      res.send(query);
    });
  } else {
    console.log(req.body);
    insertLink(req.body.url, function() {
      res.send(req.body);
    });
  }

});

function insertLink(link, callback) {
  MongoClient.connect(dbPath, function(err, db) {
    if (err) { return console.log(err); }

    db.collection('links').insert({ url: link }, function(err, result) {      
      if (err) { return console.log(err); }
      callback();
      db.close();
    });
  });
}

// register routes ------------------------------------------------------------
app.use('/', router);

// RUN EVERYTHING!
var httpsServer = https.createServer(credentials, app);

httpsServer.listen(httpsPort, function() {
  console.log('listening on *:' + httpsPort);
});
