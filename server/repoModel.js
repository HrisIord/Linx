const mongo   = require('mongodb');
const MongoClient = mongo.MongoClient;
const dbpath = "mongodb://127.0.0.1:27017/linxdb";

// ----------------------------------------------------------------------------
//                                REPOS MODEL 
// ----------------------------------------------------------------------------


module.exports = function () {
  collectionInit();
  return {
    insert: insert,
    select: select,
    insertLink: insertLink
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
  });
}

/**
 * Creates a new repo belonging to the passed in userId with the passed in name
 * The callback should take in err, result, in the same format as the callback for db.collection.insert
 */
function insert(userId, name, callback) {
  // Generate document to be added to database
  var repo = {};
  repo['permissions'] = userId;
  repo['name'] = name;
  repo['links'] = [];
  repo['createdDate'] = new Date();

  // Connect to the db
  MongoClient.connect(dbpath, function (err, db) {
    if (err) { return console.dir(err); }

    var repos_collection = db.collection('repos');
    repos_collection.insert(repo, function (err, result) {
      if (err) { return callback(err, result); }

      // add the repo to the user's list
      var repoId = result.insertedIds[0];
      var user_collection = db.collection('users');
      user_collection.update(
        { '_id': mongo.ObjectID(userId) },
        { $addToSet: { 'repos': repoId } },

        function (err, result) {
          select(repoId, function(err, repo) {
            callback(err, repo);
          });
        }
      );
    });
  });
}

/**
 * Gets a repo from the database given a the ID of a repo.
 */
function select(repoId, callback) {
  MongoClient.connect(dbpath, function (err, db) {
    if (err) { return console.dir(err); }

    var collection = db.collection('repos');
    var promise = collection.findOne({'_id': mongo.ObjectID(repoId)});
    promise.then(
      function (repo) {
        if (!repo) {
          callback("The repo does not exist.", null);
        } else {
          callback(null, repo);
        }
      }, 
      function (reason) {
        console.log("[error] repos select - ");
        console.log(reason);
        callback(reason, null);
      });
  });
}

function insertLink(repoId, link, userId, callback) {
  // Generate document to be added to database
  var newLink = {};
  newLink['name'] = link.name;
  newLink['url'] = link.url;
  newLink['createdDate'] = new Date();
  newLink['createdBy'] = userId;

  MongoClient.connect(dbpath, function (err, db) {
    if (err) { return console.dir(err); }

    var collection = db.collection('repos');
    collection.update(
      { '_id': mongo.ObjectID(repoId) },
      { $addToSet: { 'links': newLink } },

      function (err, result) {
        callback(err, result);
      }
    );
  });
}