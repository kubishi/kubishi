const SentenceModel = require('../models/SentenceModel');
const express = require('express');
const lodash = require('lodash');
const helpers = require('../helpers');


const allFields = ['english', 'paiute', 'image', 'audio', 'notes', 'paiuteTokens', 'englishTokens', 'tokenMap', 'tags'];
const requiredFields = ['english', 'paiute'];
const defaultSearchFields = ['english', 'paiute'];

const ObjectId = require('mongoose').Types.ObjectId;

/** 
 * Adds a sentence to the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function createSentence(req, res) {
    let diff = lodash.difference(requiredFields, Object.keys(req.body));

    if (diff.length > 0) {
        res.status(400).json({
            success: false, 
            result: "Missing params in request body: " + diff.toString()
        });
        return;
    }

    let sentence = new SentenceModel(lodash.pick(req.body, allFields));
    sentence.save().then(result => {
        return res.json({success: true, result: result});
    }).catch(err => {
        return res.status(500).json({success: false, result: err});
    });
}

/** 
 * Updates a sentence in the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function updateSentence(req, res) {
    let update = lodash.pick(req.body, allFields);
    SentenceModel.updateOne(
        {_id: req.params.id}, {$set: update}
    ).then(sentence => {
        if (!sentence) {
            return res.status(400).json({ success: false, result: "No such sentence exists" });
        } else {
            return res.json({success: true, result: sentence});
        }
    }).catch(err => {
        return res.status(500).json({success: false, result: err});
    });
}

/** 
 * Gets a sentence from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getSentence(req, res) {
    let fields = req.query.fields || allFields;
    let project = {};
    fields.forEach(field => project[field] = 1);
    SentenceModel.findOne({_id: req.params.id}, project).populate(
        'paiuteTokens.word', 'text part_of_speech definition'
    ).populate(
        'englishTokens.word', 'text part_of_speech definition'
    ).then(sentence => {
        if (!sentence) res.status(404).json({success: false, result: sentence});
        else res.json({success: true, result: sentence});
    }).catch(err => {
        console.log(err);
        res.status(500).json({success: false, result: err});
    });
}

/** 
 * Gets a random sentence from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getRandomSentence(req, res) {
    let fields = req.query.fields || allFields;
    let project = {};
    fields.forEach(field => project[field] = true);

    const match = JSON.parse(req.query.match || null);
    SentenceModel.countDocuments(match, (err, count) => {
        if (count <= 0) {
            return res.status(404).json({success: false, result: "Sentences is empty"});
        } 
        var random = Math.floor(Math.random() * count)
        SentenceModel.findOne(match, project).skip(random).then(result => {
            return res.json({success: true, result: result});
        }).catch(err => {
            return res.status(500).json({success: false, result: err});
        });
    });
}


/** 
 * Deletes a sentence from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function deleteSentence(req, res) {
    SentenceModel.findByIdAndDelete(req.params.id).then(result => {
        if (!result || result.deletedCount <= 0) {
            return res.status(404).json({success: false, result: "No sentence with ID found"});
        } else {
            return res.json({success: true, result: result});
        }
    }).catch(err => {
        return res.status(500).json({success: false, result: err});
    });
}

/** 
 * Search for sentence.
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
    let pipeline = helpers.getSearchPipeline(
        req.query.query, 
        mode, 
        searchFields, 
        limit, 
        offset, 
        project, 
        match
    );
    
    SentenceModel.aggregate(pipeline).then(result => {
        if (!result || result.length <= 0) {
            return res.json({success: true, result: [], total: 0});
        } else {
            return res.json({success: true, result: result[0].result, total: result[0].total});
        }
    }).catch(result => {
        res.status(500).json({success: false, result: result});
    });
}

function retrieveContainsWord(req, res) {
    let wordId = req.params.id;
    
    let offset = parseInt(req.query.offset || 0);
    let limit = parseInt(req.query.limit || helpers.DEFAULT_LIMIT);

    let pipeline = [
        {
            $match: {'paiuteTokens.word': ObjectId(wordId)}
        },
        {
            $facet: {
                result: [
                    { $skip: offset },
                    { $limit: limit },
                ],
                total: [{ $count: 'count' }]
            }
        },
        {$unwind: {path: '$total'}},
        {
            $project: {
                result: 1,
                total: '$total.count'
            }
        }
    ];

    SentenceModel.aggregate(pipeline).then(result => { 
        if (!result || result.total <= 0) {
            return res.json({success: true, result: [], total: 0});
        } else {
            if (result.length <= 0) {
                return res.json({success: true, result: [], total: 0});
            }
            SentenceModel.populate(result[0].result, {path: 'paiuteTokens.word', select: 'text definition part_of_speech'}).then(_result => {
                return res.json({success: true, result: _result, total: result.total});
            }).catch(err => {
                console.error(err);
                res.status(500).json({success: false, result: err, total: 0});
            })
        }
    }).catch(err => {
        console.log(err);
        return res.status(500).json({success: false, result: err, total: 0});
    });
}

/** 
 * Get tags
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getTags(req, res) {
    SentenceModel.aggregate(helpers.tagsPipeline).then(result => {
        if (result.length < 1) {
            return res.status(500).json({success: false, result: result});
        }
        return res.status(200).json({success: true, result: result[0].tags});
    }).catch(err => {
        console.error(err);
        return res.status(500).json({success: false, result: err});
    })
}

module.exports = {
    create: createSentence,
    update: updateSentence,
    retrieve: getSentence,
    delete: deleteSentence,
    search: search,
    random: getRandomSentence,
    retrieveContainsWord: retrieveContainsWord,
    retrieveTags: getTags
};