const express = require('express');
const router = express.Router();

// GET all projects
router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Get all projects' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single project
router.get('/:id', async (req, res) => {
  try {
    res.json({ message: `Get project ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new project
router.post('/', async (req, res) => {
  try {
    res.status(201).json({ message: 'Create new project', data: req.body });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update project
router.put('/:id', async (req, res) => {
  try {
    res.json({ message: `Update project ${req.params.id}`, data: req.body });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    res.json({ message: `Delete project ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 