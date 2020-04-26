/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
const CONNECTION = process.env.DB;
var bodyParser = require("body-parser");
//my functions
const threadsController = require("../controllers/threads.js");
const repliesController = require("../controllers/replies.js");

module.exports = function(app) {
  const threads = new threadsController();
  const replies = new repliesController();

  app
    .route("/api/threads/:board")
    .get(function(req, res) {
      var board = req.params.board;

      threads.get(board, function(err, response) {
        if (err) return console.log(err);
        res.json(response);
      });
    })

    .post(function(req, res) {
      var board = req.params.board;

      var newThread = {
        text: req.body.text,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        delete_password: req.body.delete_password,
        replies: []
      };

      threads.post(board, newThread, function(err, response) {
        if (err) return console.log(err);

        res.redirect("/b/" + board + "/");
      });
    })

    .delete(function(req, res) {
      var board = req.params.board;

      var id = {
        _id: ObjectId(req.body.thread_id)
      };

      var password = req.body.delete_password;

      threads.delete(board, id, password, function(err, result) {
        if (err) return console.log(err);
        res.type("text").send(result);
      });
    })

    .put(function(req, res) {
      var board = req.params.board;
      var id = {
        _id: ObjectId(req.body.report_id)
      };

      threads.put(board, id, function(err, result) {
        if (err) return console.log(err);
        res.type("text").send(result);
      });
    });

  app
    .route("/api/replies/:board")
    .post(function(req, res) {
      //console.log(req.body)
      var board = req.params.board;
      var id = {
        _id: ObjectId(req.body.thread_id)
      };
      var newReplie = {
        _id: ObjectId(),
        text: req.body.text,
        created_on: new Date(),
        delete_password: req.body.delete_password,
        reported: false
      };

      replies.post(board, id, newReplie, function(err, response) {
        if (err) console.log(err);
        if ((response = "success")) {
          res.redirect("/b/" + board + "/" + req.body.thread_id);
        } else {
          res.type("text").send(response);
        }
      });
    })

    .get(function(req, res) {
      var board = req.params.board;
      var query = req.query;
      //console.log(query);
      var id = {
        _id: ObjectId(query.thread_id)
      };

      replies.get(board, id, function(err, response) {
        if (err) console.log(err);
        res.json(response);
      });
    })

    // Delete request

    .delete(function(req, res) {
      var board = req.params.board;
      var password = req.body.delete_password;
      var reply_id = req.body.reply_id;
      var thread_id = ObjectId(req.body.thread_id);

      replies.delete(board, thread_id, reply_id, password, function(
        err,
        response
      ) {
        if (err) console.log(err);
        res.type("text").send(response);
      });
    })
    .put(function(req, res) {
      var board = req.params.board;
      var thread_id = req.body.thread_id;
      var reply_id = req.body.reply_id;

      replies.put(board, thread_id, reply_id, function(err, response) {
        if (err) console.log(err);
        res.type("text").send(response);
      });
    });
};
