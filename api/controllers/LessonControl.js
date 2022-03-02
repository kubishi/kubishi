const LessonModel = require('../models/LessonModel');

const express = require('express');
const lodash = require('lodash');

const allFields = ['title', 'chapter', 'words', 'lessons'];
const requiredFields = ['title', 'chapter'];


/** 
 * Adds a lesson to the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function createLesson(req, res) {
    let diff = lodash.difference(requiredFields, Object.keys(req.body));

    if (diff.length > 0) {
        res.status(400).json({
            success: false, 
            result: "Missing params in request body: " + diff.toString()
        });
        return;
    }

    let lesson = new LessonModel(lodash.pick(req.body, allFields));
    lesson.save().then(result => {
        return res.json({success: true, result: result});
    }).catch(err => {
        return res.status(500).json({success: false, result: err});
    });
}


/** 
 * Updates a lesson in the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
 function updateLesson(req, res) {
    let update = lodash.pick(req.body, allFields);
    LessonModel.updateOne(
        {_id: req.params.id}, {$set: update}
    ).then(lesson => {
        if (!lesson) {
            return res.status(400).json({ success: false, result: "No such lesson exists" });
        } else {
            return res.json({success: true, result: lesson});
        }
    }).catch(err => {
        return res.status(500).json({success: false, result: err});
    });
}


/** 
 * Gets a lesson from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
 function getLesson(req, res) {
    let fields = req.query.fields || allFields;
    let project = {};
    fields.forEach(field => project[field] = 1);
    LessonModel.findOne({_id: req.params.id}, project).populate(
        'words.word', 'text part_of_speech definition image audio notes'
    ).populate(
        'sentences.sentence', 'paiute english image audio notes paiuteTokens englishTokens'
    ).then(lesson => {
        if (!lesson) res.status(404).json({success: false, result: lesson});
        else res.json({success: true, result: lesson});
    }).catch(err => {
        console.log(err);
        res.status(500).json({success: false, result: err});
    });
}

/** 
 * Gets al lessons from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
 function getLessons(req, res) {
    let fields = req.query.fields || allFields;
    let project = {};
    fields.forEach(field => project[field] = 1);
    LessonModel.find({}, {_id: 1, title: 1, chapter: 1}).then(lessons => {
        if (!lessons) res.status(404).json({success: false, result: lessons});
        else res.json({success: true, result: lessons});
    }).catch(err => {
        console.log(err);
        res.status(500).json({success: false, result: err});
    });
}


/** 
 * Deletes a lesson from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
 function deleteLesson(req, res) {
    LessonModel.findByIdAndDelete(req.params.id).then(result => {
        if (!result || result.deletedCount <= 0) {
            return res.status(404).json({success: false, result: "No lesson with ID found"});
        } else {
            return res.json({success: true, result: result});
        }
    }).catch(err => {
        return res.status(500).json({success: false, result: err});
    });
}


module.exports = {
    create: createLesson,
    update: updateLesson,
    retrieve: getLesson,
    retrieveAll: getLessons,
    delete: deleteLesson
};