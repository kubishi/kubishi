const mongoose = require("mongoose");

const SentenceSchema = new mongoose.Schema({
    paiute: String,
    english: String,
    image: {
        data: String,
        filename: String
    },
    audio: {
        data: String,
        filename: String
    },
    notes: String,
    paiuteTokens: [{
        token_type: String,
        text: String,
        word: {type: mongoose.Types.ObjectId, ref: 'word'}
    }],
    englishTokens: [{
        token_type: String,
        text: String,
        word: {type: mongoose.Types.ObjectId, ref: 'word'}
    }],
    tokenMap: {Number: [Number]}
});

module.exports = mongoose.model('sentence', SentenceSchema);
