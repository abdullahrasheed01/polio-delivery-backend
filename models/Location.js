// C:\Users\User\Desktop\project\backend\models\Location.js
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    default: 0
  },
  speed: {
    type: Number,
    default: 0
  },
  heading: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  address: String,
  batteryLevel: Number,
  isMoving: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for tracking user locations over time
locationSchema.index({ userId: 1, timestamp: -1 });
locationSchema.index({ timestamp: 1 });

module.exports = mongoose.model('Location', locationSchema);