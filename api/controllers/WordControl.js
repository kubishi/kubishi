const WordModel = require('../models/WordModel');
const express = require('express');
const lodash = require('lodash');

const helpers = require('../helpers');


const allFields = ['text', 'image', 'audio', 'definition', 'part_of_speech', 'notes', 'words', 'tags'];
const requiredFields = ['text', 'definition', 'part_of_speech'];
const defaultSearchFields = ['text', 'definition'];

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
    const match = JSON.parse(req.query.match || null);
    
    WordModel.countDocuments(match, (err, count) => {
        if (count <= 0) {
            return res.status(404).json({success: false, result: "Sentences is empty"});
        } 
        var random = Math.floor(Math.random() * count)
        WordModel.findOne(match, project).skip(random).then(result => {
            return res.json({success: true, result: result});
        }).catch(err => {
            return res.status(500).json({success: false, result: err});
        });
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

    let match = JSON.parse(req.query.match || null);
    if (req.query.tags) {
        match = match || {};
        match.tags = {'$in': req.query.tags};
    }

    if (req.query.pos) {
        match = match || {};
        match.part_of_speech = {'$in': req.query.pos};
    }

    let pipeline = helpers.getSearchPipeline(
        req.query.query || null, 
        mode, 
        searchFields, 
        limit, 
        offset, 
        project,
        match,
        true
    );

    WordModel.aggregate(pipeline).then(result => {
        if (!result || result.length <= 0) {
            return res.json({
                success: true, 
                result: [], 
                tags: {},
                pos: {},
                total: 0
            });
        } else {
            return res.json({
                success: true, 
                result: result[0].result, 
                total: result[0].total,
                tags: result[0].tags,
                pos: result[0].pos
            });
        }
    }).catch(result => {
        return res.status(500).json({success: false, result: result});
    });
}

/** 
 * Get tags
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getTags(req, res) {
    WordModel.aggregate(helpers.tagsPipeline).then(result => {
        if (result.length < 1) {
            return res.status(500).json({success: false, result: result});
        }
        return res.status(200).json({success: true, result: result[0].tags});
    }).catch(err => {
        console.error(err);
        return res.status(500).json({success: false, result: err});
    })
}

/** 
 * Get pos
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getPos(req, res) {
    const pipeline = [
        {
            '$match': {
                'part_of_speech': {'$exists': true}
            }
        },
        {
            '$match': {
                'part_of_speech': {'$ne': null}
            }
        },
        {
            '$group': {
                '_id': null, 
                'pos': {
                    '$addToSet': '$part_of_speech'
                }
            }
        }
    ];
    WordModel.aggregate(pipeline).then(result => {
        if (result.length < 1) {
            return res.status(500).json({success: false, result: result});
        }
        return res.status(200).json({success: true, result: result[0].pos});
    }).catch(err => {
        console.error(err);
        return res.status(500).json({success: false, result: err});
    })
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
    retrieveTags: getTags,
    retrievePartsOfSpeech: getPos
};