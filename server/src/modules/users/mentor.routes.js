const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const userController = require('./user.controller');

router.use(authenticate);
router.get('/', userController.getUsers);

module.exports = router;