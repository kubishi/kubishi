import { diff } from 'deep-object-diff';
import _ from 'lodash';

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
    let updates = diff(prevObj, obj);
    try { delete updates._id; } catch(e) {}
    
    return updates;
}

export function formatSentence(sentence) {
    let fSentence = _.cloneDeep(_.pick(sentence, ['english', 'paiute', 'image', 'audio', 'tags', 'notes', 'englishTokens', 'paiuteTokens', 'tokenMap']));
    fSentence.paiuteTokens = fSentence.paiuteTokens.map(token => {
        if (token.word != null) token.word = token.word._id;
        return token;
    });
    return fSentence;
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