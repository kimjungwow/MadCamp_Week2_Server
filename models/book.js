var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookSchema = new Schema({
    title: String,
    author: String,
    published_date: { type: Date, default: Date.now  },
    name: String,
    number: String
});

module.exports = mongoose.model('book', bookSchema);
