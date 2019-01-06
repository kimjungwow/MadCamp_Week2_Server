var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var horseSchema = new Schema({
    name: String,
    speed: Number,
    location: Number
});

module.exports = mongoose.model('horse', horseSchema);
