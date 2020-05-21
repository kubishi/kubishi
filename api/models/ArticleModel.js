const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
    title: String,
    image: {
        data: String,
        filename: String
    },
    tags: [String],
    keywords: [String],
    content: String,
});

module.exports = mongoose.model('article', ArticleSchema);
