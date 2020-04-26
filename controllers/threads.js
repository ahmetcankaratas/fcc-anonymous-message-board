const MongoClient = require("mongodb").MongoClient;
const CONNECTION = process.env.DB;

function threadsController(){
  this.post = function(board,newThread,callback){
    MongoClient.connect(CONNECTION, function(err, db) {
        var dbo = db.db("threadsDB");
        dbo.collection(board).insertOne(newThread, function(err, docs) {
          if (err) console.log(err);
          //console.log(docs.ops);
          callback(null, docs)
        });
      });
  }
  
  this.get = function(board,callback){
    MongoClient.connect(CONNECTION, function(err, db) {
        var dbo = db.db("threadsDB");
        dbo
          .collection(board)
          .find({}, { reported: 0, delete_password: 0 })
          .sort({'bumped_on': -1})
          .limit(10)
          .toArray()
          .then(function(threads) {
            var re = [];
            // console.log(threads)
            threads.forEach(function(thread) {
              var replies = [];
              for (
                let i = thread.replies.length - 1;
                i > thread.replies.length - 4;
                i--
              ) {
                if (thread.replies[i]) {
                  delete thread.replies[i].reported;
                  delete thread.replies[i].delete_password;
                  replies.push(thread.replies[i]);
                }
              }

              var one = {
                _id: thread._id,
                text: thread.text,
                created_on: thread.created_on,
                bumped_on: thread.bumped_on,
                replies: replies,
                replycount: thread.replies.length
              };

              re.push(one);
            });

            //console.log(re);
           callback(null,re);
          });
      });
  }
  
  
  this.delete = function (board,id,password,callback){
    MongoClient.connect(CONNECTION, function(err, db) {
        if (err) console.log(err);
        var dbo = db.db("threadsDB");
        dbo
          .collection(board)
          .findOne(id)
          .then(function(result) {
            // console.log(result)
            db.close();
            var message ;
            if (result) {
              if (result.delete_password == password) {
                MongoClient.connect(CONNECTION, function(err, db) {
                  if (err) console.log(err);
                  var dbo = db.db("threadsDB");
                  dbo.collection(board).deleteOne(id, function(err, obj) {
                    if (err) console.log(err);
                    db.close()
                  });
                });
                message = "success";
              } else {
                message = "incorrect password";
              }
            } else {
              message = "incorrect id";
            }
              callback(null,message)
          });
      });
  };
  
  this.put = function(board,id,callback){
    MongoClient.connect(CONNECTION, function(err, db) {
        var dbo = db.db("threadsDB");
        dbo.collection(board).updateOne(
          id,
          { $set: { reported: true } },
          function(err, docs) {
            var message;
            if (err) console.log(err);
            if (docs.result.n == 0) {
              message = "invalid id";
            } else {
              message = "success";
            }
            db.close();
            callback(null,message);
          }
        );
      });
  }
}

module.exports = threadsController;