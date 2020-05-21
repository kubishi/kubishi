const ArticleModel = require('../models/ArticleModel');
const express = require('express');
const lodash = require('lodash');

const helpers = require('../helpers');

const allFields = ['title', 'image', 'tags', 'keywords', 'content'];
const requiredFields = ['title', 'content'];
const defaultSearchFields = ['title', 'tags', 'content'];

/** 
 * Adds an article to the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function createArticle(req, res) {
    let diff = lodash.difference(requiredFields, Object.keys(req.body));

    if (diff.length > 0) {
        res.status(400).json({
            success: false, 
            result: "Missing params in request body: " + diff.toString()
        });
        return;
    }

    let { title, image, tags, keywords, content } = req.body;

    let article = new ArticleModel({
        title: title,
        image: image,
        tags: tags,
        keywords: keywords,
        content: content,
    });

    article.save().then((result => {
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
 * Updates an article in the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function updateArticle(req, res) {
    let update = lodash.pick(req.body, allFields);
    ArticleModel.updateOne({_id: req.params.id}, {$set: update}).then(article => {
        if (!article || article.nModified <= 0) {
            res.status(404).json({ success: false, result: "No such article exists" });
        } else {
            res.json({success: true, result: article});
        }
    }).catch(err => {
        res.status(500).json({success: false, result: err});
    });
}

/** 
 * Gets an article from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getArticle(req, res) {
    let fields = req.query.fields || allFields;
    let project = {};
    fields.forEach(field => project[field] = 1);
    ArticleModel.findOne({_id: req.params.id}, project).then(result => {
        if (!result) {
            return res.status(404).json({success: false, result: "No article with ID found."});
        } else {
            return res.json({success: true, result: result});
        }
    }).catch(result => {
        return res.status(500).json({success: false, result: result});
    });
}

/** 
 * Gets a random article from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getRandomArticle(req, res) {
    let fields = req.query.fields || allFields;
    let project = {};
    fields.forEach(field => project[field] = 1);
    ArticleModel.aggregate(
        [
            {
                $sample: {size: 1}
            },
            {
                $project: project
            }
        ],
    ).then(result => {
        if (result == null || result.length <= 0) {
            res.status(404).json({success: false, result: "Articles is empty"});
        } else {
            return res.json({success: true, result: result[0]});
        }
    }).catch(err => {
        return res.status(500).json({success: false, result: err});
    });
}

/** 
 * Deletes an article from the database.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function deleteArticle(req, res) {
    ArticleModel.findByIdAndDelete(req.params.id).then(result => {
        if (!result || result.deletedCount <= 0) {
            res.status(404).json({success: false, result: "No article with ID found"});
        } else {
            res.json({success: true, result: result});
        }
    }).catch(err => {
        res.status(500).json({success: false, result: err});
    });
}

/** 
 * Search for an article.
 * @param {express.Request} req
 * @param {express.Response} res
 */
function search(req, res) {
    let mode = req.query.mode == null ? "text" : req.query.mode;
    let offset = parseInt(req.query.offset || 0);
    let limit = parseInt(req.query.limit || helpers.DEFAULT_LIMIT);
    
    let searchFields = req.query.searchFields || defaultSearchFields;
    let fields = req.query.fields || allFields;
    let project = {};
    fields.forEach(field => project[field] = 1);
    let pipeline = helpers.getSearchPipeline(req.query.query, mode, searchFields, limit, offset, project);

    
    ArticleModel.aggregate(pipeline).then(result => {
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
    create: createArticle,
    update: updateArticle,
    retrieve: getArticle,
    delete: deleteArticle,
    search: search,
    random: getRandomArticle,
};