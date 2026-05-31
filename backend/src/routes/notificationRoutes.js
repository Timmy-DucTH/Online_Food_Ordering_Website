const express = require('express');
const router = express.Router();
const notificationCtrl = require('../controllers/notificationController');

router.post('/', notificationCtrl.createNotification);
router.get('/user/:userId', notificationCtrl.getUserNotifications);
router.patch('/:notificationId/read', notificationCtrl.markAsRead);
router.patch('/user/:userId/read-all', notificationCtrl.markAllAsRead);

module.exports = router;
