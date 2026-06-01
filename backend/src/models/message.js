const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Nội dung tin nhắn không được để trống'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('message', MessageSchema);
