const mongoose = require('mongoose');

const InterventionSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    world: { type: String },
    color: { type: String },
    moodBefore: { type: String },
    moodAfter: { type: String },
    blocks: [{ id: String, title: String, type: String, instruction: String }],
    stressLevel: { type: Number },
    completedAt: { type: Date, default: Date.now },
    energyImpact: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('InterventionSession', InterventionSessionSchema);
