/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function() {
  var testid1;
  var testid2;
  var testreply;

  suite("API ROUTING FOR /api/threads/:board", function() {
    suite("POST", function() {
      test("Test POST /api/threads/general with thread", function(done) {
        chai
          .request(server)
          .post("/api/threads/general")
          .send({
            board: "general",
            text: "This is text",
            delete_password: "123"
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            chai
              .request(server)
              .post("/api/threads/general")
              .send({
                board: "general2",
                text: "This is text",
                delete_password: "123"
              });
            done();
          });
      });
    });

    suite("GET", function() {
      test("Test GET /api/threads/general with 10 threads and most recent 3 thread", function(done) {
        chai
          .request(server)
          .get("/api/threads/general")
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.equal(res.body.length, 10);
            assert.property(res.body[0], "_id");
            assert.property(res.body[0], "text");
            assert.property(res.body[0], "created_on");
            assert.property(res.body[0], "bumped_on");
            assert.notProperty(res.body[0], "reported");
            assert.notProperty(res.body[0], "delete_password");
            assert.property(res.body[0], "replies");
            assert.isArray(res.body[0].replies);
            assert.isBelow(res.body[0].replies.length, 4);
            if (res.body[0].replies.length > 0) {
              assert.property(res.body[0].replies[0], "_id");
              assert.property(res.body[0].replies[0], "text");
              assert.property(res.body[0].replies[0], "created_on");
              assert.notProperty(res.body[0].replies[0], "reported");
              assert.notProperty(res.body[0].replies[0], "delete_password");
            }
            testid1 = res.body[0]._id;
            testid2 = res.body[1]._id;
            done();
          });
      });
    });

    suite("DELETE", function() {
      test("Test DELETE /api/threads/general with id", function(done) {
        chai
          .request(server)
          .delete("/api/threads/general")
          .send({
            board: "general",
            thread_id: testid2,
            delete_password: "123"
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });

      test("Test DELETE /api/threads/general with wrong password", function(done) {
        chai
          .request(server)
          .delete("/api/threads/general")
          .send({
            board: "general",
            thread_id: testid1,
            delete_password: "1234"
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password");
            done();
          });
      });
    });

    suite("PUT", function() {
      test("TEST PUT /api/threads/general with updated reported", function(done) {
        chai
          .request(server)
          .put("/api/threads/general")
          .send({
            board: "general",
            report_id: testid1
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", function() {
    suite("POST", function() {
      test("Test POST /api/replies/general with replies", function(done) {
        chai
          .request(server)
          .post("/api/replies/general")
          .send({
            thread_id: testid1,
            text: "This is replie",
            delete_password: "123"
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });
    });

    suite("GET", function() {
      test("Test GET /api/replies/general with all replies ", function(done) {
        chai
          .request(server)
          .get("/api/replies/general?thread_id=" + testid1)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, "_id");
            assert.property(res.body, "text");
            assert.property(res.body, "created_on");
            assert.property(res.body, "bumped_on");
            assert.notProperty(res.body, "reported");
            assert.notProperty(res.body, "delete_password");
            assert.property(res.body, "replies");
            assert.isArray(res.body.replies);
            if (res.body.replies.length > 0) {
              assert.property(res.body.replies[0], "_id");
              assert.property(res.body.replies[0], "text");
              assert.property(res.body.replies[0], "created_on");
              assert.notProperty(res.body.replies[0], "reported");
              assert.notProperty(res.body.replies[0], "delete_password");
            }
            testreply = res.body.replies[0]._id;
            done();
          });
      });
    });

    suite("PUT", function() {
      test("TEST PUT /api/replies/general with updated reply reported", function(done) {
        chai
          .request(server)
          .put("/api/replies/general")
          .send({
            board: "general",
            thread_id: testid1,
            reply_id: testreply
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });
    });

    suite("DELETE", function() {
      test("Test DELETE REPLY /api/replies/general with id", function(done) {
        chai
          .request(server)
          .delete("/api/replies/general")
          .send({
            board: "general",
            thread_id: testid1,
            reply_id: testreply,
            delete_password: "123"
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });

      test("Test DELETE REPLY /api/replies/general with wrong password", function(done) {
        chai
          .request(server)
          .delete("/api/replies/general")
          .send({
            board: "general",
            thread_id: testid1,
            reply_id: testreply,
            delete_password: "1234"
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password");
            done();
          });
      });
    });
  });
});
