const Project = require('../models/Project');

// Get all projects
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.user.id })
            .populate('owner', 'name email')
            .populate('team.user', 'name email');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single project
const getProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.id
        }).populate('owner', 'name email')
          .populate('team.user', 'name email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create project
const createProject = async (req, res) => {
    try {
        // Validate dates
        const startDate = new Date(req.body.startDate);
        const expectedEndDate = new Date(req.body.expectedEndDate);
        
        if (expectedEndDate <= startDate) {
            return res.status(400).json({ 
                message: 'Expected end date must be after start date' 
            });
        }

        // Validate budget
        const estimatedBudget = req.body.budget?.estimated || 0;
        const spentBudget = req.body.budget?.spent || 0;

        if (spentBudget > estimatedBudget) {
            return res.status(400).json({
                message: 'Spent amount cannot exceed estimated budget'
            });
        }

        const project = await Project.create({
            ...req.body,
            owner: req.user.id,
            'budget.estimated': estimatedBudget,
            'budget.spent': spentBudget,
            'progress.planned': req.body.progress?.planned || 0,
            'progress.completed': req.body.progress?.completed || 0
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update project
const updateProject = async (req, res) => {
    try {
        // Validate dates if provided
        if (req.body.startDate && req.body.expectedEndDate) {
            const startDate = new Date(req.body.startDate);
            const expectedEndDate = new Date(req.body.expectedEndDate);
            
            if (expectedEndDate <= startDate) {
                return res.status(400).json({ 
                    message: 'Expected end date must be after start date' 
                });
            }
        }

        // Validate budget if updating budget fields
        if (req.body.budget) {
            const currentProject = await Project.findOne({
                _id: req.params.id,
                owner: req.user.id
            });

            if (!currentProject) {
                return res.status(404).json({ message: 'Project not found' });
            }

            const estimatedBudget = req.body.budget.estimated ?? currentProject.budget.estimated;
            const spentBudget = req.body.budget.spent ?? currentProject.budget.spent;

            if (spentBudget > estimatedBudget) {
                return res.status(400).json({
                    message: 'Spent amount cannot exceed estimated budget'
                });
            }
        }

        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            req.body,
            { new: true, runValidators: true }
        ).populate('owner', 'name email')
         .populate('team.user', 'name email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete project
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get project analytics
const getProjectAnalytics = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const analytics = {
            performance: {
                index: project.analytics.performanceIndex,
                scheduleVariance: project.analytics.scheduleVariance,
                costVariance: project.analytics.costVariance
            },
            progress: {
                completed: project.progress.completed,
                planned: project.progress.planned,
                variance: project.progress.completed - project.progress.planned
            },
            budget: {
                estimated: project.budget.estimated,
                spent: project.budget.spent,
                remaining: project.budget.estimated - project.budget.spent,
                breakdown: project.budget.breakdown
            },
            risks: {
                index: project.analytics.riskIndex,
                distribution: {
                    high: project.risks.filter(r => r.impact === 'high').length,
                    medium: project.risks.filter(r => r.impact === 'medium').length,
                    low: project.risks.filter(r => r.impact === 'low').length
                }
            },
            quality: project.analytics.qualityMetrics,
            forecast: project.analytics.forecast,
            trends: project.analytics.trends
        };

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get portfolio analytics
const getPortfolioAnalytics = async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.user.id });

        const analytics = {
            overview: {
                total: projects.length,
                status: {
                    planning: projects.filter(p => p.status === 'planning').length,
                    inProgress: projects.filter(p => p.status === 'in-progress').length,
                    delayed: projects.filter(p => p.status === 'delayed').length,
                    completed: projects.filter(p => p.status === 'completed').length
                }
            },
            performance: {
                averageIndex: projects.reduce((acc, p) => acc + p.analytics.performanceIndex, 0) / projects.length,
                onTrack: projects.filter(p => p.analytics.performanceIndex >= 1).length,
                atRisk: projects.filter(p => p.analytics.performanceIndex < 1).length
            },
            financials: {
                totalBudget: projects.reduce((acc, p) => acc + p.budget.estimated, 0),
                totalSpent: projects.reduce((acc, p) => acc + p.budget.spent, 0),
                averageVariance: projects.reduce((acc, p) => acc + p.analytics.costVariance, 0) / projects.length
            },
            risks: {
                totalHigh: projects.reduce((acc, p) => acc + p.risks.filter(r => r.impact === 'high').length, 0),
                totalMedium: projects.reduce((acc, p) => acc + p.risks.filter(r => r.impact === 'medium').length, 0),
                averageRiskIndex: projects.reduce((acc, p) => acc + p.analytics.riskIndex, 0) / projects.length
            }
        };

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getProjectAnalytics,
    getPortfolioAnalytics
}; 