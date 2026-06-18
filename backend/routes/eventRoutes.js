const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   POST /api/events
 * @desc    Log a real emotional event
 * @access  Private
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { type, metrics, metadata } = req.body;
        
        const newEvent = await Event.create({
            userId: req.user.id,
            type,
            metrics,
            metadata,
            timestamp: new Date()
        });

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: 'Error logging event', error: error.message });
    }
});

/**
 * @route   GET /api/events/analytics
 * @desc    Get real analytics for the admin dashboard
 * @access  Private/Admin
 */
router.get('/analytics', authMiddleware, async (req, res) => {
    try {
        const totalEvents = await Event.countDocuments();
        const panicEvents = await Event.countDocuments({ type: 'PANIC_MODE_ACTIVATED' });
        const highRiskFlags = await Event.countDocuments({ type: 'AI_HIGH_RISK_FLAG' });
        
        const distribution = await Event.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        const stressTrends = await Event.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    avgStress: { $avg: "$metrics.stress" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            summary: { totalEvents, panicEvents, highRiskFlags },
            distribution,
            stressTrends
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics', error: error.message });
    }
});

/**
 * @route   GET /api/events/summary
 * @desc    Get current user emotional summary for DNA
 * @access  Private
 */
router.get('/summary', authMiddleware, async (req, res) => {
    try {
        const events = await Event.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(50);
        
        if (events.length === 0) {
            return res.json({
                dna: [
                    { subject: 'Calmness', A: 0 },
                    { subject: 'Focus', A: 0 },
                    { subject: 'Anxiety', A: 0 },
                    { subject: 'Resilience', A: 0 },
                    { subject: 'Energy', A: 0 },
                    { subject: 'Awareness', A: 0 },
                ]
            });
        }

        const avg = (field) => events.reduce((acc, curr) => acc + (curr.metrics[field] || 0), 0) / events.length;

        res.json({
            dna: [
                { subject: 'Calmness', A: avg('mood') },
                { subject: 'Focus', A: avg('focus') },
                { subject: 'Anxiety', A: avg('anxiety') },
                { subject: 'Resilience', A: avg('recoveryScore') },
                { subject: 'Energy', A: avg('energy') },
                { subject: 'Awareness', A: 100 - avg('stress') },
            ]
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching summary', error: error.message });
    }
});

module.exports = router;
