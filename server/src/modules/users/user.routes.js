const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { updateProfileValidation } = require('./user.validation');
const authenticate = require('../../middleware/authenticate');
const { upload } = require('../../config/cloudinary');

// All user routes require authentication
router.use(authenticate);

router.get('/',         userController.getUsers);
router.get('/me',       userController.getMe);
router.put('/me',       updateProfileValidation, userController.updateMe);
router.put('/me/photo', upload.single('avatar'),  userController.updatePhoto);
router.get('/:id',      userController.getUserById);

module.exports = router;