import lodash from 'lodash';
import deepdash from 'deepdash-es';
const _ = deepdash(lodash);

export function remove_punctuation (str) {
    // FROM: https://stackoverflow.com/a/31777931
    return str.replace(/(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g,"")
}

export const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

export function getUpdates(prevObj, obj) {
    return _.pick(obj, _.paths(obj, {leavesOnly: true}).filter(path => {
        let val = _.get(obj, path);
        return val != null && !lodash.isEqual(val, _.get(prevObj, path));
    }));
}

export function formatSentence(sentence) {
    let fSentence = lodash.cloneDeep(lodash.pick(sentence, ['english', 'paiute', 'image', 'audio', 'notes', 'englishTokens', 'paiuteTokens', 'tokenMap']));
    fSentence.paiuteTokens = fSentence.paiuteTokens.map(token => {
        if (token.word != null) token.word = token.word._id;
        return token;
    });
    return fSentence;
}

export function getTagLabel(tag) {
    return tag.startsWith("tag:") ? tag.slice(4) : tag;
}  

/**
 * 
 * @param {String} part_of_speech 
 */
export function getPosLabel(part_of_speech) {
    return part_of_speech.toLowerCase().replace('_', ' ');
}

/**
 * 
 * @param {String} part_of_speech 
 */
export function getPosValue(part_of_speech) {
    return part_of_speech.toUpperCase().replace(' ', '_');
}


export function setdefault(obj, key, value) {
    if (!obj.hasOwnProperty(key)) {
        obj[key] = value;
    }
    return obj[key];
}

export function getdefault(obj, key, value = null) {
    if (obj.hasOwnProperty(key)) {
        return obj[key];
    }
    return value;
}