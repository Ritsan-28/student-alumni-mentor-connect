const express = require('express');
const router = express.Router();
const connectionController = require('./connection.controller');
const authenticate = require('../../middleware/authenticate');

router.use(authenticate);

router.post('/',                          connectionController.sendRequest);
router.get('/',                           connectionController.getMyConnections);
router.get('/pending',                    connectionController.getPendingRequests);
router.get('/status/:targetId',           connectionController.getConnectionStatus);
router.put('/:id/accept',                 connectionController.acceptRequest);
router.put('/:id/decline',                connectionController.declineRequest);
router.delete('/:id',                     connectionController.removeConnection);

module.exports = router;