const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
    title: String,
    words: [{
        word: {type: mongoose.Types.ObjectId, ref: 'word'},
        difficulty: Number,
        preferredEnglish: [String],
        preferredPaiute: [String],
        acceptableEnglish: [String],
        acceptablePaiute: [String]
    }],
    sentences: [{
        sentence: {type: mongoose.Types.ObjectId, ref: 'sentence'},
        difficulty: Number,
        preferredEnglish: [String],
        preferredPaiute: [String],
        acceptableEnglish: [String],
        acceptablePaiute: [String]
    }]
});

module.exports = mongoose.model('lesson', LessonSchema);
