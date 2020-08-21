

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
 * @param {[String]} project
 * 
 * @returns {[Object]}
 */
function getSearchPipeline(query, mode, field, limit, offset, project, match = null, count_pos = false) {
    let pipeline = [];

    if (query) {
        if (mode == "text") {
            pipeline.push({
                $search: {$text: query, $language: "none" }
            });
            pipeline.push({
                $sort: { score: { $meta: "textScore" } } 
            });
        } else if (mode == "words") {
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
    }
    
    if (match) {
        pipeline.push({$match: match});
    }

    if (project['sentences']) {
        pipeline.push(
            {
                $lookup: {
                    from: 'sentences', 
                    localField: 'sentences', 
                    foreignField: '_id', 
                    as: 'sentences'
                }
            }
        );
    }

    if (project['words']) {
        pipeline.push(
            {
                $lookup: {
                    from: 'words', 
                    localField: 'words', 
                    foreignField: '_id', 
                    as: 'words'
                }
            }
        );
    }

    let facet = {};
    facet.result = [
        { $skip: offset },
        { $limit: limit },
        {$project: project}
    ];
    facet.total = [{ $count: 'count' }];
    facet.tags = [
        {
            $project: {
                tags: 1
            }
        }, 
        {
            $unwind: {
                path: '$tags'
            }
        },
        {
            $group: {
                _id: '$tags',
                count: {$sum: 1}
            }
        }
    ];

    if (count_pos) {
        facet.pos = [
            {
                $project: {
                    part_of_speech: {$toUpper: '$part_of_speech'}
                }
            }, 
            {
                $group: {
                    _id: '$part_of_speech',
                    count: {$sum: 1}
                }
            }
        ];
    }

    // Get total and limit
    pipeline = pipeline.concat([
        {
            $facet: facet
        },
        {$unwind: {path: '$total'}},
        {
            $project: {
                result: 1,
                total: '$total.count',
                tags: '$tags',
                pos: count_pos ? '$pos' : undefined
            }
        }
    ]);

    return pipeline;
    
}

const tagsPipeline = [
    {
        '$match': {
            'tags': {
                '$exists': true
            }
        }
    }, {
        '$unwind': '$tags'
    }, {
        '$group': {
            '_id': null, 
            'tags': {
                '$addToSet': '$tags'
            }
        }
    }
];

module.exports = {
    DEFAULT_LIMIT: 10,
    parseSignedRequest: parseSignedRequest,
    getSearchPipeline: getSearchPipeline,
    tagsPipeline: tagsPipeline
}