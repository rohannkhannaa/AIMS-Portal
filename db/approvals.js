const mongoose = require('mongoose');
const { Schema } = mongoose;

const approvalSchema = new Schema ({
    studentId : String,
    courseId : String,
    approvalByInstructor : Number,
    approvalByAdvisor : Number,
});

module.exports = mongoose.model("approval", approvalSchema);