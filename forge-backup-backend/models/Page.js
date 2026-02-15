const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled',
    trim: true
  },
  icon: {
    type: String,
    default: '📄'
  },
  coverUrl: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  favorite: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page',
    default: null
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PageSchema.index({ createdAt: -1 });
PageSchema.index({ updatedAt: -1 });
PageSchema.index({ favorite: 1 });
PageSchema.index({ archived: 1 });
PageSchema.index({ title: 'text' });

module.exports = mongoose.model('Page', PageSchema);