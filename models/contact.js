var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contactSchema = new Schema({
    name: String,
    number: String,
    img: String,
    fbid: String
});

module.exports = mongoose.model('contact', contactSchema);
