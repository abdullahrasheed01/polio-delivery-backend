// C:\Users\User\Desktop\project\backend\routes\polio.js
const express = require('express');
const Task = require('../models/Task');
const PolioEmployee = require('../models/PolioEmployee');
const Location = require('../models/Location');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get polio employee profile
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await PolioEmployee.findOne({ userId: req.user._id })
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

// Get assigned tasks
router.get('/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      assignedTo: req.user._id,
      type: 'polio'
    })
    .populate('assignedBy', 'name')
    .sort({ dueDate: 1 });

    res.json({
      message: 'Tasks fetched successfully',
      tasks,
      total: tasks.length
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

// Update task status
router.put('/tasks/:id/status', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const taskId = req.params.id;

    const task = await Task.findOne({
      _id: taskId,
      assignedTo: req.user._id,
      type: 'polio'
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    
    if (status === 'completed') {
      task.completedAt = new Date();
      
      // Update polio employee stats
      const employee = await PolioEmployee.findOne({ userId: req.user._id });
      if (employee) {
        employee.completedHouses += 1;
        await employee.updatePerformance();
      }
    }

    // Add notes if provided
    if (notes) {
      task.notes.push({
        text: notes,
        addedBy: req.user._id
      });
    }

    await task.save();

    res.json({
      message: 'Task status updated successfully',
      task
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

// Add note to task
router.post('/tasks/:id/notes', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const taskId = req.params.id;

    const task = await Task.findOne({
      _id: taskId,
      assignedTo: req.user._id,
      type: 'polio'
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.notes.push({
      text,
      addedBy: req.user._id
    });

    await task.save();

    res.json({
      message: 'Note added successfully',
      task
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Server error adding note' });
  }
});

// Update location
router.post('/location', auth, async (req, res) => {
  try {
    const { latitude, longitude, accuracy, address } = req.body;

    const location = new Location({
      userId: req.user._id,
      latitude,
      longitude,
      accuracy,
      address
    });

    await location.save();

    // Update last activity in polio employee profile
    await PolioEmployee.findOneAndUpdate(
      { userId: req.user._id },
      { lastActivity: new Date() }
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

// Get performance stats
router.get('/performance', auth, async (req, res) => {
  try {
    const employee = await PolioEmployee.findOne({ userId: req.user._id });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const stats = {
      totalHousesAssigned: employee.totalHousesAssigned,
      completedHouses: employee.completedHouses,
      pendingHouses: employee.totalHousesAssigned - employee.completedHouses,
      performanceScore: employee.performanceScore,
      experience: employee.experience,
      areaAssigned: employee.areaAssigned
    };

    res.json({
      message: 'Performance stats fetched successfully',
      stats
    });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({ message: 'Server error fetching performance' });
  }
});

module.exports = router;