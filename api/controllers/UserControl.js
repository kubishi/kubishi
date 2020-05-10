const User = require('../models/UserModel');
const express = require('express');
const lodash = require('lodash');

/** 
 * Adds a user to the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getUser(req, res) {
    User.UserModel.findOne({ids: req.params.id}).then(result => {
        if (!result) {
            res.status(404).json({success: false, result: "No user with ID found"});
        } else {
            res.json({success: true, result: result});
        }
    }).catch(err => {
        res.status(500).json({success: false, result: err});
    });
}

/** 
 * Adds a user to the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function createUser(req, res) {

    let diff = lodash.difference(
        ['id', 'email', 'name', 'created', 'type'],
        Object.keys(req.body)
    );

    if (diff.length > 0) {
        res.status(400).json({
            success: false, 
            result: "Missing params in request body: " + diff.toString()
        });
        return;
    }

    if (User.UserType[req.body.type] == null) {
        res.status(400).json({success: false, result: 'Invalid type: ' + req.body.type});
        return;
    }

    let user = new User.UserModel({
        ids: [req.body.id],
        email: req.body.email,
        name: req.body.name,
        created: req.body.created,
        type: req.body.type,
    });

    user.save().then(result => {
        res.json({success: true, result: result});
    }).catch(err => {
        res.status(500).json({success: false, result: err});
    });
}

/** 
 * Updates a user in the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function updateUser(req, res) {
    let update = lodash.pick(req.body, ['email', 'name', 'type']);
    User.UserModel.updateOne({ids: req.params.id}, {$set: update}).then(result => {
        if (!result || result.nModified <= 0) {
            res.status(404).json({ success: false, result: "No such user exists" });
        } else {
            res.json({success: true, result: result});
        }
    }).catch(err => {
        res.status(500).json({success: false, result: err});
    });
}

/** 
 * Deletes a user from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function deleteUser(req, res) {
    User.UserModel.findOneAndDelete({ids: req.params.id}).then(result => {
        if (!result || result.deletedCount <= 0) {
            res.status(404).json({success: false, result: "No user with ID found"});
        } else {
            res.json({success: true, result: result});
        }
    }).catch(err => {
        res.status(500).json({success: false, result: err});
    });
}

module.exports = {
    retrieve: getUser,
    create: createUser,
    update: updateUser,
    delete: deleteUser,
};
