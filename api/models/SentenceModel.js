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
});

module.exports = mongoose.model('sentence', SentenceSchema);
