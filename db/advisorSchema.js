const mongoose = require('mongoose');
const { Schema } = mongoose;

const advisorSchema = new Schema({
    username: String,
    email: String,
    password: String,
});

module.exports =mongoose.model("advisor", advisorSchema) ;