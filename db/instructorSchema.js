const mongoose = require('mongoose');
const { Schema } = mongoose;

const instructorSchema = new Schema ({
    username: String,
    email: String,
    password: String,
});

module.exports = mongoose.model("instructor", instructorSchema);