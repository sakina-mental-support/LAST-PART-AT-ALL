const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    detectedMood: { type: String, default: 'neutral' },
    reflectionQuestion: { type: String },
    wordCount: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);
