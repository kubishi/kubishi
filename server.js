const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const helpers = require('./api/helpers');
const path = require('path');


const User = require('./api/models/UserModel');

const app = express();

dotenv.config();

// Database
mongoose.connect(process.env.MONGO_URI, 
    {
        useNewUrlParser: true,
        retryWrites: true,
        w: 'majority'
    }
).then(() => {
    console.log("Connected to Database!")
}).catch(err => console.error(err));


// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({limit: '50mb'}));

app.use(express.static(path.join(__dirname, 'build'))); // React app

// Controllers
const WordControl = require('./api/controllers/WordControl');
const SentenceControl = require('./api/controllers/SentenceControl');
const UserControl = require('./api/controllers/UserControl');
const ArticleControl = require('./api/controllers/ArticleControl');

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {CallableFunction} next 
 */
function ensureAuthenticated(req, res, next) {
    if (!req.headers.signed_request) {
        return res.status(404).json({success: false, result: "No signed_request included in headers"});
    }
    try {
        let fb_user = helpers.parseSignedRequest(req.headers.signed_request);
        if (fb_user == null) {
            return res.status(404).json({success: false, result: "Invalid user"});
        }
    } catch (error) {
        return res.status(500).json({success: false, result: error});
    }
    return next();
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {CallableFunction} next 
 */
function ensureEditor(req, res, next) {
    if (req.headers.signed_request == null) {
        return res.status(400).json({success: false, result: "No signed_request included in headers"});
    }
    
    let fb_user = helpers.parseSignedRequest(req.headers.signed_request);
    if (fb_user == null) {
        return res.status(404).json({success: false, result: "Invalid user"});
    }
    User.UserModel.findOne({ids: fb_user.user_id}).then(user => {
        if (!user) {
            return res.status(404).json({success: false, result: "No user found"});
        } else if (User.UserType[user.type] == null || User.UserType[user.type] < User.UserType.EDITOR) {
            return res.status(401).json({success: false, result: "User does not have edit permissions"});
        } else {
            return next();
        }
    }).catch(err => {
        return res.status(500).json({success: false, result: err});
    });
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {CallableFunction} next 
 */
function ensureUser(req, res, next) {
    let decoded = helpers.parseSignedRequest(req.headers.signed_request);
    if (decoded.user_id != req.params.id) {
        return res.status(401).json({success: false, result: "You are not authorized to view this user's account information."});
    } else {
        return next();
    }
}

// --- ROUTES --- //

// crud - words
app.post('/api/word', ensureEditor, WordControl.create);
app.put('/api/word/:id', ensureEditor, WordControl.update);
app.get('/api/word/:id',  WordControl.retrieve);
app.delete('/api/word/:id', ensureEditor, WordControl.delete);

app.post('/api/word/:id/related', ensureEditor, WordControl.addRelatedWord);
app.delete('/api/word/:id/related/:related_id', ensureEditor, WordControl.deleteRelatedWord);

app.post('/api/word/:id/sentence', ensureEditor, WordControl.addSentence);
app.delete('/api/word/:id/sentence/:sentence_id', ensureEditor, WordControl.deleteSentence);

// crud - sentences
app.post('/api/sentence', ensureEditor, SentenceControl.create);
app.put('/api/sentence/:id', ensureEditor, SentenceControl.update);
app.get('/api/sentence/:id', SentenceControl.retrieve);
app.delete('/api/sentence/:id', ensureEditor, SentenceControl.delete);

// crud - articles
app.post('/api/article', ensureEditor, ArticleControl.create);
app.put('/api/article/:id', ensureEditor, ArticleControl.update);
app.get('/api/article/:id', ArticleControl.retrieve);
app.delete('/api/article/:id', ensureEditor, ArticleControl.delete);

// random
app.get('/api/random/word', WordControl.random);
app.get('/api/random/sentence', SentenceControl.random);
app.get('/api/random/article', ArticleControl.random);

// search
app.get('/api/search/word', WordControl.search);
app.get('/api/search/sentence', SentenceControl.search);
app.get('/api/search/article', ArticleControl.search);


// crud - users
app.post('/api/user', ensureAuthenticated, (req, res) => {
    if (req.body.type == 'USER') {
        return UserControl.create(req, res);
    } else {
        return ensureEditor(req, res, UserControl.create);
    }
});

app.get('/api/user/:id', ensureAuthenticated, ensureUser, UserControl.retrieve);
app.put('/api/user/:id', ensureEditor, ensureUser, UserControl.update);
app.delete('/api/user/:id', ensureEditor, ensureUser, UserControl.delete);

app.get('/api', (req, res) => {
    res.json({success: true, result: 'Welcome to the Yaduha API'});
});

// Serve react app
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});  

// Start Server
app.listen(process.env.PORT || 8080, () => console.log("Server started on port " + (process.env.PORT || 8080)));

