const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public or standard user can fetch feed posts
router.get('/', postController.getPosts);

// Authenticated endpoints
router.post('/', verifyToken, postController.createPost);
router.delete('/:postId', verifyToken, postController.deletePost);
router.put('/:postId/react', verifyToken, postController.toggleReactPost);
router.post('/:postId/comment', verifyToken, postController.addComment);

module.exports = router;
