const WordListModel = require('../models/WordListModel');
const express = require('express');
const lodash = require('lodash');

const helpers = require('../helpers');


const allFields = ['name', 'user', 'description', 'words'];
const requiredFields = ['name', 'user'];

/** 
 * Adds a word to the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function createWordList(req, res) {
    let diff = lodash.difference(requiredFields, Object.keys(req.body));

    if (diff.length > 0) {
        res.status(400).json({
            success: false, 
            result: "Missing params in request body: " + diff.toString()
        });
        return;
    }

    let wordlist = new WordListModel({
        name: req.body.name,
        user: req.body.user,
        description: req.body.description
    });

    wordlist.save().then((result => {
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
 * Updates a wordlist in the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
 function updateWordList(req, res) {
    let update = lodash.pick(req.body, allFields);
    WordListModel.updateOne({_id: req.params.id}, {$set: update}).then(wordlist => {
        if (!wordlist || wordlist.nModified <= 0) {
            res.status(404).json({ success: false, result: "No such wordlist exists" });
        } else {
            res.json({success: true, result: wordlist});
        }
    }).catch(err => {
        res.status(500).json({success: false, result: err});
    });
}

/** 
 * Updates a word in the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function addWord(req, res) {
    WordListModel.updateOne(
        { _id: req.params.id }, 
        { $push: { words: req.params.wordid } }
    ).then(wordlist => {
        if (!wordlist || wordlist.nModified <= 0) {
            res.status(404).json({ success: false, result: "No such wordlist exists" });
        } else {
            res.json({success: true, result: word});
        }
    }).catch(err => {
        res.status(500).json({success: false, result: err});
    });
}

/** 
 * Add related word to the wordlist.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function addWord(req, res) {
    WordListModel.updateOne(
        {_id: req.params.id}, {$addToSet: {words: req.params.wordid}}
    ).then(wordlist => {
        if (!wordlist) {
            res.status(404).json({ success: false, result: "No such wordlist exists" });
        } else {
            res.json({success: true, result: wordlist});
        }
    }).catch(err => {
        res.status(500).json({success: false, result: err});
    });
}


/** 
 * Deletes a word in the wordlist.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function deleteWord(req, res) {
    WordListModel.updateOne(
        {_id: req.params.id}, {$pullAll: {words: [req.params.wordid]}}
    ).then(wordlist => {
        if (!wordlist) {
            res.status(404).json({ success: false, result: "No such wordlist exists" });
        } else {
            res.json({success: true, result: wordlist});
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
function getWordList(req, res) {
    let fields = req.query.fields || allFields;
    let project = {};
    fields.forEach(field => project[field] = 1);

    let find = WordListModel.findOne({_id: req.params.id}, project);
    if (fields.includes('words')) {
        find = find.populate('words');
    }

    find.then(result => {
        if (!result) {
            return res.status(404).json({success: false, result: "No wordlist with ID found."});
        } else {
            return res.json({success: true, result: result});
        }
    }).catch(result => {
        return res.status(500).json({success: false, result: result});
    });
}

/** 
 * Gets a word from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
 function getWordListByUser(req, res) {
    let fields = req.query.fields || allFields;
    let project = {};
    fields.forEach(field => project[field] = 1);

    let find = WordListModel.find({user: req.params.id}, project);
    if (fields.includes('words')) {
        find = find.populate('words');
    }

    find.then(result => {
        if (!result) {
            return res.status(404).json({success: false, result: "No wordlist for user ID found."});
        } else {
            return res.json({success: true, result: result});
        }
    }).catch(result => {
        return res.status(500).json({success: false, result: result});
    });
}

/** 
 * Deletes a wordlist from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function deleteWordList(req, res) {
    WordListModel.findByIdAndDelete(req.params.id).then(result => {
        if (!result || result.deletedCount <= 0) {
            res.status(404).json({success: false, result: "No wordlist with ID found"});
        } else {
            res.json({success: true, result: result});
        }
    }).catch(err => {
        res.status(500).json({success: false, result: err});
    });
}

module.exports = {
    create: createWordList,
    update: updateWordList,
    addWord: addWord,
    deleteWord: deleteWord,
    retrieve: getWordList,
    retrieveByUser: getWordListByUser,
    delete: deleteWordList
};