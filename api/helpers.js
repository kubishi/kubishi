

const jwt = require('jsonwebtoken');
const base64url = require('base64url');
const crypto = require('crypto');
const dotenv = require('dotenv');
const lodash = require('lodash');

dotenv.config();
const SECRET = process.env.FACEBOOK_SECRET;

function parseSignedRequest(signedRequest) {
    encoded_data = signedRequest.split('.', 2);
    // decode the data
    sig = encoded_data[0];
    json = base64url.decode(encoded_data[1]);
    data = JSON.parse(json); // ERROR Occurs Here!

    // check algorithm - not relevant to error
    if (!data.algorithm || data.algorithm.toUpperCase() != 'HMAC-SHA256') {
        console.error('Unknown algorithm. Expected HMAC-SHA256');
        return null;
    }

    // check sig - not relevant to error
    expected_sig = crypto.createHmac('sha256', SECRET).update(encoded_data[1]).digest('base64').replace(/\+/g,'-').replace(/\//g,'_').replace('=','');
    if (sig !== expected_sig) {
        console.error('Bad signed JSON Signature!');
        return null;
    }

    return data;
}

/** 
 * Search for word.
 * @param {String} query
 * @param {String} mode
 * @param {String} field
 * @param {Number} limit
 * @param {Number} offset
 */
function getSearchPipeline(query, mode, field, limit, offset) {
    /**
     * @type {mongoose.DocumentQuery} prom
     */
    let pipeline = [];
    if (mode == "words") {
        pipeline.push({
            $search: {
                regex: {
                    query: query, 
                    path: field,
                    allowAnalyzedField: true
                }
            }
        });
    } else if (mode == "contains") {
        pipeline.push({
            $search: {
                regex: {
                    query: '.*' + lodash.escapeRegExp(query) + '.*',
                    path: field,
                    allowAnalyzedField: true
                }
            }
        });
    } else if (mode == "regex") {
        pipeline.push({
            $search: {
                regex: {
                    query: query,
                    path: field,
                    allowAnalyzedField: true
                }
            }
        });
    } else if (mode == "fuzzy") {
        pipeline.push({
            $search: {
                text: {
                    query: query, 
                    path: field, 
                    fuzzy: {}
                }
            }
        });
    } else {
        throw "Invalid search mode";
    }

    pipeline = pipeline.concat([
        {
            $lookup: {
                from: 'sentences', 
                localField: 'sentences', 
                foreignField: '_id', 
                as: 'sentences'
            }
        },
        {$skip: offset},
        {$limit: limit},
    ]);

    return pipeline;
    
}

module.exports = {
    DEFAULT_LIMIT: 10,
    parseSignedRequest: parseSignedRequest,
    getSearchPipeline: getSearchPipeline,
}