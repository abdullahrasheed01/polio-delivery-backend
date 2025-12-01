// C:\Users\User\Desktop\project\backend\routes\admin.js
const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const PolioEmployee = require('../models/PolioEmployee');
const DeliveryEmployee = require('../models/DeliveryEmployee');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const userRole = req.user.role; // polio_admin or delivery_admin
    
    let stats = {};
    
    if (userRole === 'polio_admin') {
      const totalEmployees = await User.countDocuments({ role: 'polio_employee' });
      const totalTasks = await Task.countDocuments({ type: 'polio' });
      const completedTasks = await Task.countDocuments({ 
        type: 'polio', 
        status: 'completed' 
      });
      const pendingTasks = await Task.countDocuments({ 
        type: 'polio', 
        status: { $in: ['pending', 'in_progress'] } 
      });

      stats = {
        totalEmployees,
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0
      };
    } else if (userRole === 'delivery_admin') {
      const totalEmployees = await User.countDocuments({ role: 'delivery_employee' });
      const totalDeliveries = await Task.countDocuments({ type: 'delivery' });
      const completedDeliveries = await Task.countDocuments({ 
        type: 'delivery', 
        status: 'completed' 
      });
      const activeDeliveries = await Task.countDocuments({ 
        type: 'delivery', 
        status: 'in_progress' 
      });

      stats = {
        totalEmployees,
        totalDeliveries,
        completedDeliveries,
        activeDeliveries,
        successRate: totalDeliveries > 0 ? (completedDeliveries / totalDeliveries * 100).toFixed(2) : 0
      };
    }

    res.json({
      message: 'Dashboard stats fetched successfully',
      stats,
      userRole
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

// Get all employees (for admin)
router.get('/employees', adminAuth, async (req, res) => {
  try {
    const userRole = req.user.role;
    let employeeRole = '';
    
    if (userRole === 'polio_admin') {
      employeeRole = 'polio_employee';
    } else if (userRole === 'delivery_admin') {
      employeeRole = 'delivery_employee';
    }

    const employees = await User.find({ role: employeeRole })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Employees fetched successfully',
      employees,
      total: employees.length
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error fetching employees' });
  }
});

// Create new employee
router.post('/employees', adminAuth, async (req, res) => {
  try {
    const { name, email, password, phone, additionalData } = req.body;
    const userRole = req.user.role;

    let employeeRole = '';
    if (userRole === 'polio_admin') {
      employeeRole = 'polio_employee';
    } else if (userRole === 'delivery_admin') {
      employeeRole = 'delivery_employee';
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: employeeRole,
      phone
    });

    await user.save();

    // Create employee profile based on type
    if (employeeRole === 'polio_employee') {
      const polioEmployee = new PolioEmployee({
        userId: user._id,
        qualification: additionalData.qualification,
        areaAssigned: additionalData.areaAssigned,
        sector: additionalData.sector
      });
      await polioEmployee.save();
    } else if (employeeRole === 'delivery_employee') {
      const deliveryEmployee = new DeliveryEmployee({
        userId: user._id,
        vehicleType: additionalData.vehicleType,
        vehicleNumber: additionalData.vehicleNumber,
        licenseNumber: additionalData.licenseNumber,
        areaAssigned: additionalData.areaAssigned
      });
      await deliveryEmployee.save();
    }

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error creating employee' });
  }
});

// Get all tasks
router.get('/tasks', adminAuth, async (req, res) => {
  try {
    const userRole = req.user.role;
    let taskType = userRole === 'polio_admin' ? 'polio' : 'delivery';

    const tasks = await Task.find({ type: taskType })
      .populate('assignedTo', 'name email phone')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

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

module.exports = router;