const mongo   = require('mongodb');
const crypto  = require('crypto');

const MongoClient = mongo.MongoClient;
const dbpath = "mongodb://127.0.0.1:27017/linxdb";

// Crypto settings
const PBKDF2_ITERATIONS = 100000;
const PASSWD_KEYLEN = 512;
const HASH_ALGO = 'sha512';

// ----------------------------------------------------------------------------
//                                USERS MODEL 
// ----------------------------------------------------------------------------


module.exports = function () {
  userCollectionInit();
  return {
    insertUser: insertUser,
    selectUser: selectUser,
    authUser: authUser,
    insertOrSelectUserFromTwitterID: insertOrSelectUserFromTwitterID
  };
};

/**
 * Initializes the user Collection in the database 
 */
function userCollectionInit() {
  MongoClient.connect(dbpath, function(err, db) {
    if (err) { 
      return console.dir(err); 
    }

    var collection = db.collection('users');

    // Enforce a uniqueness constraint on username and email
    collection.createIndex({"username": 1}, {unique: true});
    collection.createIndex({"email": 1}, {unique: true});

  });
}

/**
 * Creates a new local user asynchronously
 * Only used when using Local authentication.
 * The callback should take in err, result, in the same format as the callback for db.collection.insert
 */
function insertUser(username, password, email, callback) {
  /** 
   * Password Hashing Process:
   * 1. Generate a random salt
   * 2. Concatenate password and salt
   * 3. Generate salt
   */

  // generate 256-bit salt. Will support up to 2^256 users
  var salt = crypto.randomBytes(32); 
  var hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PASSWD_KEYLEN, HASH_ALGO).toString('hex');

  // Generate document to be added to database
  var user = {};
  user['username'] = username;
  user['password'] = hash;
  user['salt'] = salt.toString('hex');
  user['email'] = email;

  // Connect to the db
  MongoClient.connect(dbpath, function(err, db) {
    if (err) { return console.dir(err); }

    var user_collection = db.collection('users');
    user_collection.insert(user, function(err, result) {
      callback(err, result);
    });
  });
}

/** 
 * Takes in a user ID and returns the user's properties
 */
function selectUser(userId, callback) {
  MongoClient.connect(dbpath, function (err, db) {
    if (err) { return console.dir(err); }

    var collection = db.collection('users');
    var promise = collection.findOne({'_id': mongo.ObjectID(userId)});
    promise.then(function (user) {
      if (!user) {
        callback("User ID not in database.", null);
      } else {
        callback(null, user);
      }
    }, function (reason) {
      console.log("[error] selectUser - ");
      console.log(reason);
      callback(reason, null);
    });
  });
}

/**
 * Authentication helper for Local authentication strategy
 * Verifies the username and password, and calls callback with arguments
 * The callback arguments are err, uid
 */
function authUser(username, password, callback) {
  MongoClient.connect(dbpath, function (err, db) {
    if (err) { return console.dir(err); }

    var promise = db.collection('users').findOne({'username': username});
    promise.then(function (user) {

      if (!user) {
        callback("User not found.", null);
      } else {
        // check password matches
        var salt = new Buffer(user.salt, 'hex');
        var hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PASSWD_KEYLEN, HASH_ALGO).toString('hex');
        if (hash === user.password) {
          // Success!
          callback(null, user);
        } else {
          callback("Incorrect password.", null); // Authentiation failed.
        }
      }

    }, function(reason){
      console.log("[error] authUser - ");
      console.log(reason);
      callback(reason, null);
    });
  })
}

// TODO: look over this function
/**
 * Gets the user from the database from a twitterID asynchronously
 * Creates a new User if it doesn't exist already in the database.
 * Callback should take in one argument that is either user object.
 * Note: profiledata is optional iff the twitterID is already in database.
 * Pass null in if there is no profiledata.
 * Calls callback with err, result (result is the userid)
 */
function insertOrSelectUserFromTwitterID(twitterID, profiledata, callback) {
  MongoClient.connect(dbpath, function(err, db){
    if(err) { return console.dir(err); }

    // First try to find Twitter ID in database
    var collection = db.collection('users');
    var promise = collection.findOne({'twitter-id': twitterID});
    promise.then(function(found){
      if(!found){
        // create new user
        if(!profiledata || !profiledata['username'] || !profiledata['email']){
          callback("Insufficient data in profiledata", null); // no user found; cannot create new user
        } else {
          var new_user = {}
          for(var key in profiledata){
            new_user[key] = profiledata[key];
          }
          new_user['twitter-id'] = twitterID;
          new_user['storeName'] = profiledata.username + "'s Store";
          new_user['storeDesc'] = "";
          new_user['purchases'] = [];

          // insert into collection
          collection.insert(new_user, function(err, result){
            if(err){
              console.dir(err);
              callback(err, null);
            } else {
              callback(null, result['ops'][0]);
            }
          });
        }
      } else {
        callback(null, found);
      }
    }, function(reason){
      console.log("Failure for some reason " + reason);
      callback(reason, null);
    });

  });
}