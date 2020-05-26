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
        return val == null ? _.get(prevObj, path) : val != _.get(prevObj, path);
    }));
}

export function getTagLabel(tag) {
    return tag.startsWith("tag:") ? tag.slice(4) : tag;
}  

export function replaceSpecialChars(text) {
    return text.replace("~w", "w̃").replace("~W", "W̃").replace('"u', "ü").replace('"U', "Ü");
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
