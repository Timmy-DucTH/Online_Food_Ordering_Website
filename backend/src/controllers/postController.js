const Post = require('../models/post');
const User = require('../models/user');
const Notification = require('../models/notification');

// Fetch all posts populated with author and commenters
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author_id', 'full_name email role')
      .populate('Comments.user_id', 'full_name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: posts
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// NGHIỆP VỤ 9: Viết bài đăng tương tác và đính kèm đa phương tiện (BM7, QĐ9) 
exports.createPost = async (req, res) => {
  try {
    const author_id = req.user ? req.user.id : req.body.author_id;
    const { content, images, videos } = req.body;

    if (!author_id) {
      return res.status(400).json({ status: 'fail', message: 'Bài viết phải có người đăng!' });
    }

    if (!content) {
      return res.status(400).json({ status: 'fail', message: 'Nội dung bài viết không được để trống!' });
    }

    // RÀNG BUỘC KIỂM DUYỆT TỪ NGỮ THÔ TỤC (Áp dụng QĐ 9: Không vi phạm pháp luật/thuần phong mỹ tục)
    const toxicKeywords = ['đảo chính', 'phản động', 'lừa đảo'];
    const containsToxic = toxicKeywords.some(keyword => content.toLowerCase().includes(keyword));

    if (containsToxic) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bài đăng bị hệ thống chặn tự động do chứa nội dung hoặc từ ngữ vi phạm quy định!'
      });
    }

    const newPost = new Post({
      author_id,
      content,
      images: images || [],
      videos: videos || []
    });

    await newPost.save();

    // Populate user info for returned post
    const populatedPost = await Post.findById(newPost._id).populate('author_id', 'full_name email role');

    res.status(201).json({
      status: 'success',
      message: '📝 Đã đăng tải bài viết lên tường mạng xã hội cộng đồng!',
      data: populatedPost
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// NGHIỆP VỤ 10: Tương tác bài viết (Thích bài viết - Reacts) 
exports.toggleReactPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const user_id = req.user ? req.user.id : req.body.user_id;

    if (!user_id) {
      return res.status(400).json({ status: 'fail', message: 'Thiếu ID người dùng tương tác!' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ status: 'fail', message: 'Bài viết không tồn tại!' });
    }

    // Nếu đã like rồi thì bấm lại sẽ là Bỏ thích (Unlike), ngược lại thì thêm ID vào mảng reacts
    const isReacted = post.reacts.includes(user_id);
    if (isReacted) {
      post.reacts.pull(user_id);
    } else {
      post.reacts.push(user_id);

      // Gửi thông báo cho tác giả bài viết nếu người thích không phải là chính tác giả
      if (post.author_id.toString() !== user_id.toString()) {
        try {
          const liker = await User.findById(user_id);
          const notify = new Notification({
            user_id: post.author_id,
            title: 'Tương tác mới trên bài viết của bạn',
            message: `${liker ? liker.full_name : 'Một người dùng'} đã thích bài viết của bạn!`,
            type: 'system',
            is_read: false
          });
          await notify.save();
        } catch (e) {
          console.error('Error sending like notification:', e.message);
        }
      }
    }

    await post.save();
    
    const updatedPost = await Post.findById(postId)
      .populate('author_id', 'full_name email role')
      .populate('Comments.user_id', 'full_name email role');

    res.status(200).json({
      status: 'success',
      message: isReacted ? '💔 Đã bỏ thích bài viết' : '❤️ Đã thích bài viết thành công!',
      data: updatedPost
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Add comment to a post
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Nội dung bình luận không được để trống!' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ status: 'fail', message: 'Bài viết không tồn tại!' });
    }

    post.Comments.push({
      user_id,
      content: content.trim()
    });

    await post.save();

    // Gửi thông báo cho tác giả bài viết nếu người bình luận không phải là chính tác giả
    if (post.author_id.toString() !== user_id.toString()) {
      try {
        const commenter = await User.findById(user_id);
        const notify = new Notification({
          user_id: post.author_id,
          title: 'Bình luận mới trên bài viết',
          message: `${commenter ? commenter.full_name : 'Một người dùng'} đã bình luận: "${content.length > 40 ? content.substring(0, 37) + '...' : content}"`,
          type: 'system',
          is_read: false
        });
        await notify.save();
      } catch (e) {
        console.error('Error sending comment notification:', e.message);
      }
    }

    const updatedPost = await Post.findById(postId)
      .populate('author_id', 'full_name email role')
      .populate('Comments.user_id', 'full_name email role');

    res.status(200).json({
      status: 'success',
      message: '💬 Đã thêm bình luận thành công!',
      data: updatedPost
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ status: 'fail', message: 'Bài viết không tồn tại!' });
    }

    // Kiểm tra quyền: Tác giả bài viết hoặc Admin mới được xóa
    if (post.author_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Bạn không có quyền xóa bài viết này!' });
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      status: 'success',
      message: '🗑️ Đã xóa bài viết thành công!'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};