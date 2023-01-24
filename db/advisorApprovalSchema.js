const mongoose = require('mongoose');
const { Schema } = mongoose;

const advisorApprovalSchema = new Schema ({
    advisorId : String,
    studentId : String,
    courseId : String,
    status : Number,
});

module.exports = mongoose.model("advisorApprove", advisorApprovalSchema);