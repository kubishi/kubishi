const mongoose = require("mongoose");

const SentenceSchema = new mongoose.Schema({
    paiute: String,
    english: String,
    image: String,
    audio: String,
});

module.exports = mongoose.model('sentence', SentenceSchema);
