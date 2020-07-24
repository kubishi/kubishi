const WordModel = require('../models/WordModel');
const express = require('express');
const lodash = require('lodash');

const helpers = require('../helpers');


const allFields = ['text', 'image', 'audio', 'definition', 'part_of_speech', 'notes', 'words', 'tags'];
const requiredFields = ['text', 'definition', 'part_of_speech'];
const defaultSearchFields = ['text', 'definition', 'tags'];

/** 
 * Adds a word to the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function createWord(req, res) {
    let diff = lodash.difference(requiredFields, Object.keys(req.body));

    if (diff.length > 0) {
        res.status(400).json({
            success: false, 
            result: "Missing params in request body: " + diff.toString()
        });
        return;
    }

    let word = new WordModel({
        text: req.body.text,
        image: req.body.image,
        audio: req.body.audio,
        definition: req.body.definition,
        part_of_speech: req.body.part_of_speech,
        words: req.body.words,
        sentences: req.body.sentences,
        notes: req.body.notes,
        tags: req.body.tags,
    });

    word.save().then((result => {
        if (!result) {
            return res.status(500).json({success: false, result: result});
        } else {
            return res.json({success: true, result: result});
        }
    })).catch(err => {
        return res.status(500).json({success: false, result: err});
    });
}

/** 
 * Updates a word in the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function updateWord(req, res) {
    let update = lodash.pick(req.body, allFields);
    WordModel.updateOne({_id: req.params.id}, {$set: update}).then(word => {
        if (!word || word.nModified <= 0) {
            res.status(404).json({ success: false, result: "No such word exists" });
        } else {
            res.json({success: true, result: word});
        }
    }).catch(err => {
        res.status(500).json({success: false, result: err});
    });
}

/** 
 * Add related word.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function addRelatedWord(req, res) {
    if (!req.body.word) {
        return res.status(400).json({success: false, result: "No 'word' included in body"});
    }
    WordModel.updateOne(
        {_id: req.params.id}, {$addToSet: {words: req.body.word}}
    ).then(word => {
        if (!word) {
            res.status(404).json({ success: false, result: "No such word exists" });
        } else {
            res.json({success: true, result: word});
        }
    }).catch(err => {
        res.status(500).json({success: false, result: err});
    });
}


/** 
 * Deletes a related word.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function deleteRelatedWord(req, res) {
    WordModel.updateOne(
        {_id: req.params.id}, {$pullAll: {words: [req.params.related_id]}}
    ).then(word => {
        if (!word) {
            res.status(404).json({ success: false, result: "No such word exists" });
        } else {
            res.json({success: true, result: word});
        }
    }).catch(err => {
        res.status(500).json({success: false, result: err});
    });
}

/** 
 * Gets a word from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getWord(req, res) {
    let fields = req.query.fields || allFields;
    let project = {};
    fields.forEach(field => project[field] = 1);

    let find = WordModel.findOne({_id: req.params.id}, project);
    if (fields.includes('sentences')) {
        find = find.populate('sentences');
    }
    if (fields.includes('words')) {
        find = find.populate('words');
    }

    find.then(result => {
        if (!result) {
            return res.status(404).json({success: false, result: "No word with ID found."});
        } else {
            return res.json({success: true, result: result});
        }
    }).catch(result => {
        return res.status(500).json({success: false, result: result});
    });
}

/** 
 * Gets a random word from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getRandomWord(req, res) {
    let fields = req.query.fields || allFields;
    let project = {};
    fields.forEach(field => project[field] = 1);
    WordModel.aggregate(
        [
            {
                $sample: {size: 1}
            }, 
            {
                $lookup: {
                    from: 'sentences',
                    localField: 'sentences',
                    foreignField: '_id',
                    as: 'sentences'
                }
            },
            {
                $project: project
            }
        ]
    ).then(result => {
        if (result == null || result.length <= 0) {
            res.status(404).json({success: false, result: "Words is empty"});
        } else {
            return res.json({success: true, result: result[0]});
        }
    }).catch(err => {
        return res.status(500).json({success: false, result: err});
    });
}

/** 
 * Deletes a word from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function deleteWord(req, res) {
    WordModel.findByIdAndDelete(req.params.id).then(result => {
        if (!result || result.deletedCount <= 0) {
            res.status(404).json({success: false, result: "No word with ID found"});
        } else {
            res.json({success: true, result: result});
        }
    }).catch(err => {
        res.status(500).json({success: false, result: err});
    });
}

/** 
 * Deletes a sentence from the word.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function deleteSentence(req, res) {
    WordModel.updateOne({_id: req.params.id}, {$pullAll: {sentences: [req.params.sentence_id]}}).then(word => {
        if (!word) {
            return res.status(404).json({ success: false, result: "No such word exists" });
        } else {
            return res.json({success: true, result: word});
        }
    }).catch(err => {
        return res.status(500).json({success: false, result: err});
    });
}


/** 
 * Adds a sentence from to the word.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function addSentence(req, res) {
    if (!req.body.sentence) {
        return res.status(400).json({success: false, result: "No 'sentence' included in body"});
    }
    WordModel.updateOne({_id: req.params.id}, {$addToSet: {sentences: req.body.sentence}}).then(word => {
        if (!word) {
            return res.status(404).json({ success: false, result: "No such word exists" });
        } else {
            return res.json({success: true, result: word});
        }
    }).catch(err => {
        return res.status(500).json({success: false, result: err});
    });
}


/** 
 * Search for word.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function search(req, res) {
    let mode = req.query.mode == null ? "contains" : req.query.mode;
    let offset = parseInt(req.query.offset || 0);
    let limit = parseInt(req.query.limit || helpers.DEFAULT_LIMIT);
    
    let searchFields = req.query.searchFields || defaultSearchFields;
    let fields = req.query.fields || allFields;
    let project = {};
    fields.forEach(field => project[field] = 1);
    let pipeline = helpers.getSearchPipeline(req.query.query, mode, searchFields, limit, offset, project);

    WordModel.aggregate(pipeline).then(result => {
        if (!result || result.length <= 0) {
            return res.json({success: true, result: [], total: 0});
        } else {
            return res.json({success: true, result: result[0].result, total: result[0].total});
        }
    }).catch(result => {
        return res.status(500).json({success: false, result: result});
    });
}

module.exports = {
    create: createWord,
    update: updateWord,
    retrieve: getWord,
    delete: deleteWord,
    deleteSentence: deleteSentence,
    addSentence: addSentence,
    search: search,
    addRelatedWord: addRelatedWord,
    deleteRelatedWord: deleteRelatedWord,
    random: getRandomWord,
};