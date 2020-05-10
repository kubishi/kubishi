const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserType = {
    USER: 1,
    EDITOR: 2,
    DEVELOPER: 3,
    ADMIN: 4
 };

const UserSchema = new Schema({
    ids: [String],
    email: String,
    name: String,
    created: Date,
    type: String,
});

module.exports = {
    'UserModel': mongoose.model('User', UserSchema),
    'UserType': UserType,
};