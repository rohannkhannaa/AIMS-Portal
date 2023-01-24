const mongoose = require('mongoose');
const { Schema } = mongoose;

const instructorApprovalSchema = new Schema ({
    studentId : String,
    instructorId : String,
    courseId : String,
    status : Number,
});

module.exports = mongoose.model("instructorApprove", instructorApprovalSchema);