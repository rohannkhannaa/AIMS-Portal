const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema ({
    courseId : String,
    instructorId : String,
    advisorId : String,
});

module.exports = mongoose.model("course", courseSchema);