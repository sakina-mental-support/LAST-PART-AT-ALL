const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        required: true,
        enum: [
            'CHAT_STRESS_DETECTED', 
            'PANIC_MODE_ACTIVATED', 
            'SESSION_COMPLETED', 
            'EXERCISE_SKIPPED', 
            'JOURNAL_NEGATIVE', 
            'BREATHING_FINISHED', 
            'MUSIC_THERAPY_STARTED', 
            'AI_HIGH_RISK_FLAG',
            'RECOVERY_JOURNEY_STARTED',
            'RECOVERY_JOURNEY_COMPLETED'
        ]
    },
    metrics: {
        mood: Number,
        stress: Number,
        anxiety: Number,
        energy: Number,
        recoveryScore: Number
    },
    metadata: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
