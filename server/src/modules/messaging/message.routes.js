const express = require('express');
const router = express.Router();
const messageController = require('./message.controller');
const authenticate = require('../../middleware/authenticate');

router.use(authenticate);

router.post('/',                          messageController.getOrCreateConversation);
router.get('/',                           messageController.getMyConversations);
router.get('/:id/messages',               messageController.getMessages);
router.post('/:id/messages',              messageController.sendMessage);

module.exports = router;