const Post = require('../models/post');

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author_id', 'full_name email role')
      .populate('Comments.user_id', 'full_name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      message: 'Lay danh sach bai dang thanh cong!',
      data: posts
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { author_id, content, images, videos } = req.body;

    const toxicKeywords = ['dao chinh', 'phan dong', 'lua dao'];
    const normalizedContent = String(content || '').toLowerCase();
    const containsToxic = toxicKeywords.some(keyword => normalizedContent.includes(keyword));

    if (containsToxic) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bai dang bi chan do chua noi dung vi pham quy dinh!'
      });
    }

    const newPost = new Post({
      author_id,
      content,
      images: images || [],
      videos: videos || []
    });

    await newPost.save();

    res.status(201).json({
      status: 'success',
      message: 'Da dang tai bai viet thanh cong!',
      data: newPost
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user_id, content } = req.body;

    if (!user_id || !content || !content.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui long nhap day du user_id va noi dung binh luan!'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ status: 'fail', message: 'Bai viet khong ton tai!' });
    }

    post.Comments.push({
      user_id,
      content: content.trim()
    });

    await post.save();

    res.status(201).json({
      status: 'success',
      message: 'Da them binh luan thanh cong!',
      data: post
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.toggleReactPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user_id } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ status: 'fail', message: 'Bai viet khong ton tai!' });
    }

    const isReacted = post.reacts.some(id => id.toString() === user_id);
    if (isReacted) {
      post.reacts.pull(user_id);
    } else {
      post.reacts.push(user_id);
    }

    await post.save();
    res.status(200).json({
      status: 'success',
      message: isReacted ? 'Da bo thich bai viet' : 'Da thich bai viet thanh cong!',
      data: post
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
