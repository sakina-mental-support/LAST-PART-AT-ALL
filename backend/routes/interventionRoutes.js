const express = require('express');
const router = express.Router();
const InterventionSession = require('../models/InterventionSession');
const authMiddleware = require('../middleware/authMiddleware');

// Save completed intervention session
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, world, color, moodBefore, moodAfter, blocks, stressLevel, energyImpact } = req.body;
        const session = await InterventionSession.create({
            userId: req.user.id || req.user._id,
            title, world, color, moodBefore, moodAfter,
            blocks: blocks || [],
            stressLevel,
            energyImpact
        });
        res.status(201).json({ success: true, data: session });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get session history for a user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const sessions = await InterventionSession.find({ userId: req.user._id })
            .sort({ completedAt: -1 })
            .limit(50);
        res.json({ success: true, data: sessions, count: sessions.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Insights: get recovery stats
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const sessions = await InterventionSession.find({ userId: req.user.id || req.user._id });
        const totalSessions = sessions.length;
        const avgStress = totalSessions > 0 ? sessions.reduce((a, s) => a + (s.stressLevel || 50), 0) / totalSessions : 50;
        const moodCounts = sessions.reduce((acc, s) => { acc[s.moodBefore] = (acc[s.moodBefore] || 0) + 1; return acc; }, {});
        res.json({ success: true, data: { totalSessions, avgStress: Math.round(avgStress), moodCounts } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
