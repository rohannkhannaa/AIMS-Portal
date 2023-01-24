const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentSchema = new Schema({
    username: String,
    email: String,
    password: String,
});

module.exports = mongoose.model("student", studentSchema);