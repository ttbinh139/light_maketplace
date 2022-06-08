/*
 * All routes for Messages are defined here
 * Since this file is loaded in server.js into api/messages,
 *   these routes are mounted onto /messages
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();
const messageHelper = require('../lib/messageHelper')

module.exports = (db) => {
  router.get("/", (req, res) => {
    // Get logged in user
    let userId = req.session.userId;
    console.log("Line 16: ",userId);
    messageHelper.getLastestMessageByUserId(userId, db)
      .then(data => {
        if (data) {
          res.redirect(`/messages/${Number(data.id)}`);
        } else {
          res.render("messages", {error:"You don't have any messages", messages: null, messageDetail:null, conversation:null})
        }
        //res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.get("/:message_id", (req, res) => {
    // Get logged in user
    let userId = req.session.userId;
    //console.log(userId);
    let message_id = req.params.message_id;
    // Get all messsages from user

    messageHelper.getAllMessagesByUserId(userId, db)
      .then(async function(data) {
        if (data) {
          let messageDetail = await messageHelper.getMessageById(message_id, db);
          if (messageDetail) {
            if (messageDetail.sender_id != userId && messageDetail.receiver_id != userId) {
              error = "You don't belongs to this conversation";
              return res.render('messages', { userId: userId, messages: data, messageDetail: null, conversation:null, error:error });
            }
            let conversation = await messageHelper.getConversationByMessageId(message_id, db);
            console.log("line 42:", messageDetail);
            //console.log("line 39: ",conversation);
            return res.render('messages', { userId: userId, messages: data, messageDetail: messageDetail, conversation:conversation, error:null });
          } else {
            error = "This conversation doesn't exist";
            return res.render('messages', { userId: userId, messages: data, messageDetail: null, conversation:null, error:error });
          }
        } else {
          error = "You don't have any messages";
            return res.render('messages', { userId: userId, messages: data, messageDetail: null, conversation:null, error:error });
        }
      }).catch((err) => {
        res
          .status(500)
          .json({ error: err.message });
      });
  })

  router.get("/new/:listingId", (req, res) => {
    let listingId = req.params.listingId;
    //console.log("Listing ID: ",listingId);
    let userId = req.session.userId;

    // Check if the logged in user already sent message to this seller -> redirect to view message page.
    messageHelper.checkUserSentMessageToListing(userId, listingId, db)
      .then(data => {
        console.log("Line 76",data);
        if (data.rows.length > 0) {
          return res.redirect(`/messages/${Number(data.rows[0].id)}`);
        }
      })
      .catch(err => {

      });

    // Get all messsages from user
    messageHelper.getAllMessagesByUserId(userId, db)
      .then(async function(data) {
        let listing = await messageHelper.getListingFromId(listingId, db);
        console.log(listing);
        return res.render("newmessage", {userId: userId, messages: data, listing:listing});
        //return res.render('messages', { userId: userId, messages: data, conversation: messageDetail });
      }).catch((err) => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });

  router.post("/new/:listingId", (req, res) => {
    let user_id = req.session.userId;
    let listing_id = req.params.listingId;
    let message = {
      sender_id: user_id,
      listing_id: listing_id,
      created_time: new Date()
    };
    //console.log(req.body);
    let text = req.body.txtMessage;

    //console.log(message);
    //console.log(text);
    messageHelper.saveMessage(message, listing_id, text, db)
      .then(data => {
        res.status(201).send(data);
        //res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      })
  });

  router.post("/:message_id", (req, res) => {
    let user_id = req.session.userId;
    let message_id = req.params.message_id;
    let conversation = {
      message_id: message_id,
      message: req.body.txtMessage,
      owner_id: user_id,
      created_time: new Date()
    };

    messageHelper.insertNewConversation(conversation, db)
      .then(data => {
        res.status(201).send(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      })
  });

  router.get("/conversation/:message_id", (req, res) => {
    let message_id = req.params.message_id;
    messageHelper.getConversationByMessageId(message_id, db)
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => {
      res
          .status(500)
          .json({ error: err.message });
    });
  });
  return router;
};
