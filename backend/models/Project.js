const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide project title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide project description']
    },
    startDate: {
        type: Date,
        required: [true, 'Please provide start date']
    },
    expectedEndDate: {
        type: Date,
        required: [true, 'Please provide expected end date']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['planning', 'in-progress', 'delayed', 'completed'],
        default: 'planning'
    },
    budget: {
        estimated: {
            type: Number,
            required: [true, 'Please provide estimated budget'],
            default: 0
        },
        spent: {
            type: Number,
            default: 0
        },
        breakdown: [{
            category: {
                type: String,
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            spent: {
                type: Number,
                default: 0
            }
        }]
    },
    team: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['manager', 'supervisor', 'worker'],
            default: 'worker'
        },
        skills: [{
            type: String
        }]
    }],
    resources: [{
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            default: 0
        },
        allocated: {
            type: Number,
            default: 0
        },
        cost: {
            type: Number,
            default: 0
        }
    }],
    timeline: {
        milestones: [{
            title: {
                type: String,
                required: true
            },
            description: String,
            plannedDate: {
                type: Date,
                required: true
            },
            actualDate: Date,
            status: {
                type: String,
                enum: ['pending', 'completed', 'delayed'],
                default: 'pending'
            }
        }]
    },
    risks: [{
        description: {
            type: String,
            required: true
        },
        impact: {
            type: String,
            enum: ['low', 'medium', 'high'],
            required: true
        },
        mitigation: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['identified', 'mitigated', 'occurred'],
            default: 'identified'
        }
    }],
    progress: {
        completed: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        planned: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    analytics: {
        performanceIndex: {
            type: Number,
            default: 1
        },
        scheduleVariance: {
            type: Number,
            default: 0
        },
        costVariance: {
            type: Number,
            default: 0
        },
        riskIndex: {
            type: Number,
            default: 0
        },
        qualityMetrics: {
            defects: {
                type: Number,
                default: 0
            },
            rework: {
                type: Number,
                default: 0
            },
            compliance: {
                type: Number,
                default: 100
            }
        },
        forecast: {
            completionDate: Date,
            finalCost: Number,
            confidence: {
                type: Number,
                default: 0.95
            },
            delayProbability: {
                type: Number,
                default: 0
            }
        },
        trends: [{
            date: Date,
            progress: Number,
            cost: Number,
            performance: Number,
            resourceUtilization: Number
        }],
        recommendations: [{
            type: {
                type: String,
                required: true
            },
            priority: {
                type: String,
                enum: ['low', 'medium', 'high'],
                default: 'medium'
            },
            impact: {
                schedule: Number,
                cost: Number,
                quality: Number
            },
            status: {
                type: String,
                enum: ['pending', 'implemented', 'rejected'],
                default: 'pending'
            }
        }]
    }
}, {
    timestamps: true
});

// Add index for better query performance
projectSchema.index({ title: 1, owner: 1 });

// Pre-save middleware to update analytics
projectSchema.pre('save', function(next) {
    // Calculate performance index
    if (this.progress.planned > 0) {
        this.analytics.performanceIndex = this.progress.completed / this.progress.planned;
    }

    // Calculate schedule variance
    const today = new Date();
    const totalDuration = this.expectedEndDate - this.startDate;
    const elapsedDuration = today - this.startDate;
    const plannedProgress = (elapsedDuration / totalDuration) * 100;
    this.analytics.scheduleVariance = this.progress.completed - plannedProgress;

    // Calculate cost variance
    if (this.budget.estimated > 0) {
        const plannedCost = (this.progress.completed / 100) * this.budget.estimated;
        this.analytics.costVariance = plannedCost - this.budget.spent;
    }

    // Calculate risk index
    const highRisks = this.risks.filter(r => r.impact === 'high' && r.status === 'identified').length;
    const mediumRisks = this.risks.filter(r => r.impact === 'medium' && r.status === 'identified').length;
    this.analytics.riskIndex = (highRisks * 3 + mediumRisks * 2) / (this.risks.length || 1);

    // Add trend data
    this.analytics.trends.push({
        date: today,
        progress: this.progress.completed,
        cost: this.budget.spent,
        performance: this.analytics.performanceIndex,
        resourceUtilization: this.resources.reduce((acc, r) => acc + (r.allocated / r.quantity), 0) / (this.resources.length || 1)
    });

    next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project; 