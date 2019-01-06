var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var loginSchema = new Schema({
    id: String,
    password: String,
    option: String
});
module.exports = mongoose.model('login', loginSchema);
