const mongoose = require("mongoose");

const SentenceSchema = new mongoose.Schema({
    paiute: String,
    english: String
});

module.exports = mongoose.model('sentence', SentenceSchema);
