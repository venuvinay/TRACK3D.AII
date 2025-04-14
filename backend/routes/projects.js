const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectAnalytics,
  getPortfolioAnalytics,
} = require('../controllers/projectController');

// Create new project
router.post('/', auth, createProject);

// Get all projects for a user
router.get('/', auth, getAllProjects);

// Get single project
router.get('/:id', auth, getProject);

// Update project
router.patch('/:id', auth, updateProject);

// Delete project
router.delete('/:id', auth, deleteProject);

// Get project analytics
router.get('/:id/analytics', auth, getProjectAnalytics);

// Get portfolio analytics
router.get('/analytics', auth, getPortfolioAnalytics);

module.exports = router; 