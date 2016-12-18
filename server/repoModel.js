const mongo   = require('mongodb');
const MongoClient = mongo.MongoClient;
const dbpath = "mongodb://127.0.0.1:27017/linxdb";

// ----------------------------------------------------------------------------
//                                REPOS MODEL 
// ----------------------------------------------------------------------------


module.exports = function () {
  collectionInit();
  return {
    insert: insert
    // selectUser: selectUser,
    // authUser: authUser,
    // insertOrSelectUserFromTwitterID: insertOrSelectUserFromTwitterID
  };
};

/**
 * Initializes the repo collection in the database 
 */
function collectionInit() {
  MongoClient.connect(dbpath, function (err, db) {
    if (err) { 
      return console.dir(err); 
    }

    var collection = db.collection('repos');
    // Create index on userId
    collection.createIndex({"userId": 1}, {});
    collection.createIndex({"name": 1}, {unique: true});
  });
}

/**
 * Creates a new repo belonging to the passed in userId with the passed in name
 * The callback should take in err, result, in the same format as the callback for db.collection.insert
 */
function insert(userId, name, callback) {
  // Generate document to be added to database
  var repo = {};
  repo['userId'] = userId;
  repo['name'] = name;

  // Connect to the db
  MongoClient.connect(dbpath, function (err, db) {
    if (err) { return console.dir(err); }

    var repo_collection = db.collection('repos');
    repo_collection.insert(repo, function (err, result) {
      callback(err, result);
    });
  });
}

function insertLink(repoId, link, callback) {

}

/**
 * Gets a repo from the database given a the ID of a repo.
 */
function select(repoId, callback) {

}

/**
 * Gets all repos associate with a user from the database.
 */
function selectByUserID(userId, callback) {

}

/**
 * Gets a repo from the database given a name.
 */
function selectByName(name, callback) {

}

