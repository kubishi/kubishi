const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
    title: String,
    chapter: String,
    words: [{
        word: {type: mongoose.Types.ObjectId, ref: 'word'},
        preferredEnglish: [String],
        preferredPaiute: [String],
        acceptableEnglish: [String],
        acceptablePaiute: [String]
    }],
    sentences: [{
        sentence: {type: mongoose.Types.ObjectId, ref: 'sentence'},
        preferredEnglish: [String],
        preferredPaiute: [String],
        acceptableEnglish: [String],
        acceptablePaiute: [String]
    }]
});

module.exports = mongoose.model('lesson', LessonSchema);
