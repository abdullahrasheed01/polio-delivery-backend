// C:\Users\User\Desktop\project\backend\models\DeliveryEmployee.js
const mongoose = require('mongoose');

const deliveryEmployeeSchema = new mongoose.Schema({
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
  vehicleType: {
    type: String,
    enum: ['bike', 'car', 'scooter', 'bicycle'],
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true
  },
  areaAssigned: {
    type: String,
    required: true
  },
  maxDeliveriesPerDay: {
    type: Number,
    default: 20
  },
  currentDeliveries: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Generate employee ID before saving
deliveryEmployeeSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await mongoose.model('DeliveryEmployee').countDocuments();
    this.employeeId = `DEL${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DeliveryEmployee', deliveryEmployeeSchema);