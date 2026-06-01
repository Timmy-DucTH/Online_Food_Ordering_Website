const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/users', verifyToken, messageController.getChatUsers);
router.get('/:otherUserId', verifyToken, messageController.getMessages);
router.post('/', verifyToken, messageController.sendMessage);

module.exports = router;
