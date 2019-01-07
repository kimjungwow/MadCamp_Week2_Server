var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gallerySchema = new Schema({
    fbid: String,
    imageHash: String,
    imageUri: String,
    storagePath: String,
    imageFile: String
});

module.exports = mongoose.model('gallery', gallerySchema);
