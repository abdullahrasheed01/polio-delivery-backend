// C:\Users\User\Desktop\project\backend\routes\server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock Data (Temporary - MongoDB na hone par)
let users = [
  {
    id: 1,
    name: "Polio Admin",
    email: "polio@admin.com",
    password: "123456",
    role: "polio_admin",
    phone: "03001234567"
  },
  {
    id: 2, 
    name: "Delivery Admin",
    email: "delivery@admin.com",
    password: "123456",
    role: "delivery_admin",
    phone: "03001234568"
  }
];

// Mock Authentication (Temporary)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({
      message: 'Login successful',
      token: 'mock_jwt_token_' + user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, phone } = req.body;
  
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    role,
    phone
  };
  
  users.push(newUser);
  
  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone
    }
  });
});

// Mock Admin Routes
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    message: 'Dashboard data fetched successfully',
    stats: {
      totalEmployees: 15,
      totalTasks: 89,
      completedTasks: 67,
      pendingTasks: 22
    }
  });
});

// Root route add karo
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Polio Delivery Backend API is Running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      polio: '/api/polio', 
      delivery: '/api/delivery'
    }
  });
});

// Basic route
app.get('/api', (req, res) => {
  res.json({ 
    message: '🚀 Polio Delivery Backend API is Running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin', 
      polio: '/api/polio',
      delivery: '/api/delivery'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'Mock Data (MongoDB not connected)'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎯 Server running on port ${PORT}`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
  console.log(`💡 Using Mock Data - MongoDB not required`);
});