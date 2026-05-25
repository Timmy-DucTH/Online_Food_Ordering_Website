const Post = require('../models/post');

// NGHIỆP VỤ 9: Viết bài đăng tương tác và đính kèm đa phương tiện (BM7, QĐ9) 
exports.createPost = async (req, res) => {
  try {
    const { author_id, content, images, videos } = req.body;

    // RÀNG BUỘC KIỂM DUYỆT TỪ NGỮ THÔ TỤC (Áp dụng QĐ 9: Không vi phạm pháp luật/thuần phong mỹ tục) [cite: 160]
    const toxicKeywords = ['đảo chính', 'phản động', 'lừa đảo'];
    const containsToxic = toxicKeywords.some(keyword => content.toLowerCase().includes(keyword));

    if (containsToxic) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bài đăng bị hệ thống chặn tự động do chứa nội dung hoặc từ ngữ vi phạm quy định!' [cite: 160]
      });
    }

    const newPost = new Post({
      author_id,
      content, [cite: 159]
      images: images || [], [cite: 159]
      videos: videos || [] [cite: 159]
    });

    await newPost.save();

    res.status(201).json({
      status: 'success',
      message: '📝 Đã đăng tải bài viết lên tường mạng xã hội cộng đồng!',
      data: newPost
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// NGHIỆP VỤ 10: Tương tác bài viết (Thích bài viết - Reacts) 
exports.toggleReactPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user_id } = req.body;

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
    }

    await post.save();
    res.status(200).json({
      status: 'success',
      message: isReacted ? '💔 Đã bỏ thích bài viết' : '❤️ Đã thích bài viết thành công!',
      data: post
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};