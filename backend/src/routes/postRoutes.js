const express = require('express');
const router = express.Router();
const postCtrl = require('../controllers/postController');

router.get('/', postCtrl.getPosts);
router.post('/', postCtrl.createPost);
router.patch('/:postId/react', postCtrl.toggleReactPost);
router.post('/:postId/comments', postCtrl.addComment);

module.exports = router;
