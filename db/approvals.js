const mongoose = require('mongoose');
const { Schema } = mongoose;

const approvalSchema = new Schema ({
    studentId : String,
    courseId : String,
    approvalByInstructor : Boolean,
    approvalByAdvisor : Boolean,
});

module.exports = mongoose.model("approval", approvalSchema);