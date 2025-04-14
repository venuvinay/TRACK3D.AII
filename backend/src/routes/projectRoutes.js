const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');

// Get all projects
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.user._id });
        // Transform the data to match frontend expectations
        const formattedProjects = projects.map(project => ({
            _id: project._id,
            title: project.title,
            description: project.description,
            status: project.status,
            priority: project.priority,
            createdAt: project.createdAt,
            expectedEndDate: project.expectedEndDate,
            progress: {
                completed: 0, // Default value
                planned: 100 // Default value
            },
            budget: {
                estimated: 0, // Default value
                spent: 0 // Default value
            }
        }));
        res.json(formattedProjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new project
router.post('/', auth, async (req, res) => {
    try {
        const project = new Project({
            title: req.body.title,
            description: req.body.description,
            status: req.body.status || 'planning',
            priority: req.body.priority || 0,
            expectedEndDate: req.body.expectedEndDate,
            owner: req.user._id
        });
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update project
router.put('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            {
                title: req.body.title,
                description: req.body.description,
                status: req.body.status,
                priority: req.body.priority,
                expectedEndDate: req.body.expectedEndDate
            },
            { new: true }
        );
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 
