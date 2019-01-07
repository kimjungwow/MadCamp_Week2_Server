var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var horseSchema = new Schema({
    name: String,
    speed: Number,
    location: Number,
    zero100: Number,
    maxSpeed: Number,
    fallOff: Number,
    dividendRate: Number,
});

module.exports = mongoose.model('horse', horseSchema);


// Required: Zero-100, Max Speed, Fall-off Percent, dividend rate