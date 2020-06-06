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

// WORDS
// crud
app.post('/api/words', ensureEditor, WordControl.create);
app.put('/api/words/:id', ensureEditor, WordControl.update);
app.get('/api/words/:id',  WordControl.retrieve);
app.delete('/api/words/:id', ensureEditor, WordControl.delete);

app.post('/api/words/:id/related', ensureEditor, WordControl.addRelatedWord);
app.delete('/api/words/:id/related/:related_id', ensureEditor, WordControl.deleteRelatedWord);

app.get('/api/words/:id/sentences', SentenceControl.retrieveContainsWord); // get sentences that contain this word

// crud - sentences
app.post('/api/sentences', ensureEditor, SentenceControl.create);
app.put('/api/sentences/:id', ensureEditor, SentenceControl.update);
app.get('/api/sentences/:id', SentenceControl.retrieve);
app.delete('/api/sentences/:id', ensureEditor, SentenceControl.delete);

// crud - articles
app.post('/api/articles', ensureEditor, ArticleControl.create);
app.put('/api/articles/:id', ensureEditor, ArticleControl.update);
app.get('/api/articles/:id', ArticleControl.retrieve);
app.delete('/api/articles/:id', ensureEditor, ArticleControl.delete);

// random
app.get('/api/random/words', WordControl.random);
app.get('/api/random/sentences', SentenceControl.random);
app.get('/api/random/articles', ArticleControl.random);

// search
app.get('/api/search/words', WordControl.search);
app.get('/api/search/sentences', SentenceControl.search);
app.get('/api/search/articles', ArticleControl.search);


// crud - users
app.post('/api/users', ensureAuthenticated, (req, res) => {
    if (req.body.type == 'USER') {
        return UserControl.create(req, res);
    } else {
        return ensureEditor(req, res, UserControl.create);
    }
});

app.get('/api/users/:id', ensureAuthenticated, ensureUser, UserControl.retrieve);
app.put('/api/users/:id', ensureEditor, ensureUser, UserControl.update);
app.delete('/api/users/:id', ensureEditor, ensureUser, UserControl.delete);

app.get('/api', (req, res) => {
    res.json({success: true, result: 'Welcome to the Yaduha API'});
});

// Serve react app
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});  

// Start Server
app.listen(process.env.PORT || 8080, () => console.log("Server started on port " + (process.env.PORT || 8080)));

