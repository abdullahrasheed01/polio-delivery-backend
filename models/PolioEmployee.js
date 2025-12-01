// C:\Users\User\Desktop\project\backend\models\PolioEmployee.js
const mongoose = require('mongoose');

const polioEmployeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  qualification: {
    type: String,
    required: true
  },
  areaAssigned: {
    type: String,
    required: true
  },
  sector: {
    type: String,
    required: true
  },
  totalHousesAssigned: {
    type: Number,
    default: 0
  },
  completedHouses: {
    type: Number,
    default: 0
  },
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    default: 'beginner'
  },
  specialization: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  performanceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Generate employee ID before saving
polioEmployeeSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await mongoose.model('PolioEmployee').countDocuments();
    this.employeeId = `POL${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Update performance score based on completed houses
polioEmployeeSchema.methods.updatePerformance = function() {
  if (this.totalHousesAssigned > 0) {
    this.performanceScore = (this.completedHouses / this.totalHousesAssigned) * 100;
  }
  return this.save();
};

module.exports = mongoose.model('PolioEmployee', polioEmployeeSchema);