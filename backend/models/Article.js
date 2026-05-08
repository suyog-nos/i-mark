const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  // Support for multiple languages
  translations: {
    en: {
      title: String,
      content: String
    },
    np: {
      title: String,
      content: String
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected', 'flagged', 'scheduled'],
    default: 'draft'
  },
  scheduledPublish: {
    type: Date,
    required: false
  },
  reviewerComments: {
    type: String,
    default: ''
  },
  featuredImage: {
    type: String,
    required: false
  },
  additionalMedia: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  shares: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt timestamp on save
articleSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Article', articleSchema);
