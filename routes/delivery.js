// C:\Users\User\Desktop\project\backend\routes\delivery.js
const express = require('express');
const Task = require('../models/Task');
const DeliveryEmployee = require('../models/DeliveryEmployee');
const Location = require('../models/Location');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get delivery employee profile
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await DeliveryEmployee.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({
      message: 'Profile fetched successfully',
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Get assigned deliveries
router.get('/deliveries', auth, async (req, res) => {
  try {
    const deliveries = await Task.find({ 
      assignedTo: req.user._id,
      type: 'delivery'
    })
    .populate('assignedBy', 'name')
    .sort({ dueDate: 1 });

    res.json({
      message: 'Deliveries fetched successfully',
      deliveries,
      total: deliveries.length
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ message: 'Server error fetching deliveries' });
  }
});

// Update delivery status
router.put('/deliveries/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const deliveryId = req.params.id;

    const delivery = await Task.findOne({
      _id: deliveryId,
      assignedTo: req.user._id,
      type: 'delivery'
    });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    delivery.status = status;
    
    if (status === 'completed') {
      delivery.completedAt = new Date();
      
      // Update delivery employee stats
      const employee = await DeliveryEmployee.findOne({ userId: req.user._id });
      if (employee) {
        employee.totalDeliveries += 1;
        employee.currentDeliveries = Math.max(0, employee.currentDeliveries - 1);
        await employee.save();
      }
    }

    await delivery.save();

    res.json({
      message: 'Delivery status updated successfully',
      delivery
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

// Update location
router.post('/location', auth, async (req, res) => {
  try {
    const { latitude, longitude, accuracy, speed, heading, address, batteryLevel, isMoving } = req.body;

    const location = new Location({
      userId: req.user._id,
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      address,
      batteryLevel,
      isMoving
    });

    await location.save();

    // Update last location in delivery employee profile
    await DeliveryEmployee.findOneAndUpdate(
      { userId: req.user._id },
      {
        lastLocation: {
          latitude,
          longitude,
          timestamp: new Date()
        }
      }
    );

    res.json({
      message: 'Location updated successfully',
      location
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ message: 'Server error updating location' });
  }
});

// Get delivery history
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Task.find({
      assignedTo: req.user._id,
      type: 'delivery',
      status: 'completed'
    })
    .select('title description completedAt location')
    .sort({ completedAt: -1 })
    .limit(50);

    res.json({
      message: 'Delivery history fetched successfully',
      history,
      total: history.length
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

module.exports = router;