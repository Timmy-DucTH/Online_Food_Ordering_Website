const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, notificationController.getNotifications);
router.post('/', verifyToken, notificationController.createNotification); // Allow triggering custom notifications
router.put('/read-all', verifyToken, notificationController.markAllAsRead);
router.delete('/delete-all', verifyToken, notificationController.deleteAllNotifications);
router.put('/:id/read', verifyToken, notificationController.markAsRead);
router.delete('/:id', verifyToken, notificationController.deleteNotification);

module.exports = router;
