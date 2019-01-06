var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gallerySchema = new Schema({
    imgUri: String,
    fbid: String
});

module.exports = mongoose.model('gallery', gallerySchema);
