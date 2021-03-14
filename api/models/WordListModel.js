const mongoose = require("mongoose");

const WordListSchema = new mongoose.Schema({
    name: String,
    description: String,
    user: {type: mongoose.Types.ObjectId, ref: 'User'},
    words: [{type: mongoose.Types.ObjectId, ref: 'word'}]
});

module.exports = mongoose.model('wordlist', WordListSchema);
