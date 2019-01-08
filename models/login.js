var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var loginSchema = new Schema({
    id: String,
    password: String,
    option: String,
    balance: Number,
    betMoney: Number,
    horse: String,
});
module.exports = mongoose.model('login', loginSchema);
