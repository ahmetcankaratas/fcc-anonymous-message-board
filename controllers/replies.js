const MongoClient = require("mongodb").MongoClient;
const CONNECTION = process.env.DB;
var ObjectId = require("mongodb").ObjectId;

function repliesController() {
  this.post = function(board, id, newReplie, callback) {
    MongoClient.connect(CONNECTION, function(err, db) {
      if (err) console.log(err);
      var dbo = db.db("threadsDB");
      dbo
        .collection(board)
        .findOneAndUpdate(
          id,
          { $push: { replies: newReplie }, $set: { bumped_on: new Date() } },
          function(err, docs) {
            var message;
            if (err) console.log(err);
            //console.log(docs.value)
            if (docs.value == undefined) {
              message = "invalid ID";
            } else {
              message = "success";
            }
            db.close();
            callback(null, message);
          }
        );
    });
  };

  this.get = function(board, id, callback) {
    MongoClient.connect(CONNECTION, function(err, db) {
      var dbo = db.db("threadsDB");
      dbo
        .collection(board)
        .findOne(id, { reported: 0, delete_password: 0 })
        .then(function(thread) {
          //delete thread.reported
          //delete thread.delete_password
          thread.replies.forEach(data => {
            delete data.reported;
            delete data.delete_password;
          });
          callback(null, thread);
        });
    });
  };

  this.delete = function(board, thread_id, reply_id, password, callback) {
    MongoClient.connect(CONNECTION, function(err, db) {
      var dbo = db.db("threadsDB");
      dbo
        .collection(board)
        .findOne({ _id: ObjectId(thread_id) })
        .then(function(result) {
          if (result == null) {
            var message;
            message = "invalid thread id";
            callback(null, message);
          }
          db.close;
          //console.log(result)
          if (result) {
            var isHaveIndex = -1;
            for (let i = 0; i < result.replies.length; i++) {
              if (result.replies[i]._id == reply_id) {
                isHaveIndex = i;
              }
            }
            //console.log(isHaveIndex)
            if (isHaveIndex >= 0) {
              if (result.replies[isHaveIndex].delete_password == password) {
                MongoClient.connect(CONNECTION, function(err, db) {
                  var dbo = db.db("threadsDB");
                  dbo.collection(board).update(
                    {
                      _id:  ObjectId(thread_id) ,
                      "replies._id": ObjectId(reply_id) 
                    },
                    {
                      $set: { "replies.$.text": "[deleted]" }
                    },
                    function(err, docs) {
                      if (err) console.log(err);

                      message = "success";

                      db.close();
                      callback(null, message);
                    }
                  );
                });
              } else {
                message = "incorrect password";
                callback(null, message);
              }
            }
          }
        });
    });
  };
  
  this.put = function(board,thread_id,reply_id,callback){
     MongoClient.connect(CONNECTION, function(err, db) {
        var dbo = db.db("threadsDB");
        dbo.collection(board).update(
          {
            _id: ObjectId(thread_id),
            "replies._id": ObjectId(reply_id)
          },
          {
            $set: { "replies.$.reported": true }
          },
          function(err, docs) {
            var message;
            if (err) console.log(err);
            if (docs.result.n == 0) {
              message = "invalid id";
            } else {
              message = "success";
            }
            db.close();
            callback(null, message)
          }
        );
      });
  }
}

module.exports = repliesController;
