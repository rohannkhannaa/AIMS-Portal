const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const session = require("express-session");
const path = require('path');
const { json } = require("body-parser");
const { Router } = require("express");
// const studentUser = require(path.join(__dirname, '../db/studentSchema'))
// const advisorUser = require(path.join(__dirname, '../db/advisorSchema'))
// const instructorUser = require(path.join(__dirname, '../db/instructorSchema'))

const route = express.Router();
route.use(cors());
route.get("/", function (req, res) {
    res.render("homepage");
});
route.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

route.post('/', async (req, res) => {
    if (typeof req.body.username === 'undefined') {
        // Login
        const {
            email,
            password,
            loginOption
        } = req.body;
        if (loginOption == "student") {
            const students = require(path.join(__dirname, '../db/studentSchema.js'));
            const student = await students.find({ email });
            console.log(student);
            if (!student[0]) return res.status(400).send({
                message: "Invalid email"
            });
            const isPasswordValid = bcrypt.compareSync('' + password, '' + student[0].password);
            if (!isPasswordValid) return res.status(400).send({
                message: "Invalid email or password"
            });
            else {
                req.session.username = student[0].username;
                req.session.save();
                req.session.email = student[0].email;
                req.session.save();
                req.session.password = student[0].password;
                req.session.save();
                res.redirect("/studentPage");
            }
        }
        else if (loginOption == "advisor") {
            const advisors = require(path.join(__dirname, '../db/advisorSchema.js'));
            const advisor = await advisors.find({ email });
            // console.log(student);
            if (!advisor[0]) return res.status(400).send({
                message: "Invalid email"
            });
            const isPasswordValid = bcrypt.compareSync('' + password, '' + advisor[0].password);
            if (!isPasswordValid) return res.status(400).send({
                message: "Invalid email or password"
            });
            else {
                req.session.username = advisor[0].username;
                req.session.save();
                req.session.email = advisor[0].email;
                req.session.save();
                req.session.password = advisor[0].password;
                req.session.save();
                res.redirect("/advisorPage");
            }
        }
        else {//if (loginOption == "instructor") {
            const instructors = require(path.join(__dirname, '../db/instructorSchema.js'));
            const instructor = await instructors.find({ email });
            // console.log(student);
            if (!instructor[0]) return res.status(400).send({
                message: "Invalid email"
            });
            const isPasswordValid = bcrypt.compareSync('' + password, '' + instructor[0].password);
            if (!isPasswordValid) return res.status(400).send({
                message: "Invalid email or password"
            });
            else {
                req.session.username = instructor[0].username;
                req.session.save();
                req.session.email = instructor[0].email;
                req.session.save();
                req.session.password = instructor[0].password;
                req.session.save();
                res.redirect("/instructorPage");
            }
        }
    } else {
        // Register
        const {
            username,
            email,
            password,
            loginOption
        } = req.body;
        const students = require(path.join(__dirname, '../db/studentSchema.js'));
        const student = await students.find({ email });
        if (typeof student[0] != 'undefined') {
            return res.status(400).send({
                message: "Email Id already in use by a student."
            });
        }

        const instructors = require(path.join(__dirname, '../db/instructorSchema.js'));
        const instructor = await instructors.find({ email });
        if (typeof instructor[0] != 'undefined') {
            return res.status(400).send({
                message: "Email Id already in use by a instructor."
            });
        }

        const advisors = require(path.join(__dirname, '../db/advisorSchema.js'));
        const advisor = await advisors.find({ email });
        if (typeof advisor[0] != 'undefined') {
            return res.status(400).send({
                message: "Email Id already in use by a advisor."
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "r.patidar181001.2@gmail.com",
                pass: "lftnzmpgnyibshxl"
            }
        });
        const hashedPassword = bcrypt.hashSync(password, 1);
        console.log(otp);


        const mailOptions = {
            from: "r.patidar181001.2@gmail.com",
            to: email,
            subject: "OTP for login",
            text: `Your OTP is ${otp}`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).send({
                    message: "Failed to send OTP"
                });
            } else {
                console.log("OTP sent: " + info.response);
                res.send({
                    message: "OTP sent"
                });
            }
        });
        req.session.username = username;
        req.session.save();
        req.session.email = email;
        req.session.save();
        req.session.hashedPassword = hashedPassword;
        req.session.save();
        req.session.loginOption = loginOption;
        req.session.save();
        req.session.otp = otp;
        req.session.save();
        res.redirect("/otp");
    }
});

route.get("/otp", async (req, res) => {
    const username = req.session.username;
    if (typeof username == "undefined") {
        return res.status(400).send(
            '<p>Please Login first</p><a href = "/">Login now</a>'
        );
    } else {
        res.render("otp")
    };
});
route.post("/otp", async (req, res) => {
    const {
        first, second, third, fourth, fifth, sixth
    } = req.body;
    const otpEntered = first + second + third + fourth + fifth + sixth;
    const otp = req.session.otp;
    const email = req.session.email;
    const username = req.session.username;
    const hashedPassword = req.session.hashedPassword;
    const loginOption = req.session.loginOption;

    if (loginOption == "student") {
        if (otp == otpEntered) {
            console.log("Idhar to hai");
            const students = require(path.join(__dirname, '../db/studentSchema.js'));
            const newStudent = new students({
                username,
                email,
                password: hashedPassword
            });
            // console.log("Idhar hai");
            // console.log(newStudent);
            await newStudent.save();
            req.session.email = newStudent.email;
            req.session.save();
            res.redirect('/studentPage');
        } else {
            res.send({ Error: "Invalid OTP" });
        }
    } else if (loginOption == "advisor") {
        if (otp == otpEntered) {
            const advisors = require(path.join(__dirname, '../db/advisorSchema.js'));
            const newAdvisor = new advisors({
                username,
                email,
                password: hashedPassword
            });
            await newAdvisor.save();
            req.session.email = newAdvisor.email;
            req.session.save();
            res.redirect('/advisorPage');
        } else {
            res.send({ Error: "Invalid OTP" });
        }
    } else {
        if (otp == otpEntered) {
            const instructors = require(path.join(__dirname, '../db/instructorSchema.js'));
            const newInstructor = new instructors({
                username,
                email,
                password: hashedPassword
            });
            await newInstructor.save();
            req.session.email = newInstructor.email;
            req.session.save();
            res.redirect('/instructorPage');
        } else {
            res.send({ Error: "Invalid OTP" });
        }
    }
});


route.get("/studentPage", async (req, res) => {
    const email = req.session.email;
    const approvals = require(path.join(__dirname, '../db/approvals.js'));
    const username = req.session.username;
    if (typeof username == 'undefined') {
        return res.status(400).send(
            '<p>Please Login first</p><a href = "/">Login now</a>'
        );
    }
    approvals.find({ studentId: email }, function (err, approved) {
        console.log("Yha bhi dekho vro");
        console.log(approved);
        res.render("studentPage", {
            username: username,
            approved: approved
        });
    });

})
route.get("/studentEnroll", async (req, res) => {
    // const email = req.session.email;
    // const approvals = require(path.join(__dirname, '../db/approvals.js'));
    // const username = req.session.username;

    // approvals.find({}, function (err, approved) {
    const username = req.session.username;
    const email = req.session.email;
    const courses = require(path.join(__dirname, '../db/courseSchema.js'));
    const approvals = require(path.join(__dirname, '../db/approvals.js'));
    if (typeof username == 'undefined') {
        return res.status(400).send(
            '<p>Please Login first</p><a href = "/">Login now</a>'
        );
    }
    courses.find({}, function (err, courseList) {
        res.render("studentEnroll", {
            username: username,
            courseList: courseList
        });
    })
})
route.get("/enroll/:_id", async (req, res) => {
    const email = req.session.email;
    const { _id } = req.params;

    const approvals = require(path.join(__dirname, '../db/approvals.js'));
    const instructorApproves = require(path.join(__dirname, '../db/instructorApprovalSchema'))
    const advisorApproves = require(path.join(__dirname, '../db/advisorApprovalSchema'))
    const courses = require(path.join(__dirname, '../db/courseSchema.js'));
    courses.find({ _id }, async (err, course) => {
        if (err) {
            console.log(err);
        } else {
            const approval = new approvals({
                studentId: email,
                courseId: course[0].courseId,
                approvalByInstructor: 0,
                approvalByAdvisor: 0,
            });
            const instructorApprove = new instructorApproves({
                instructorId : course[0].instructorId,
                courseId : course[0].courseId,
                status : 0
            })
            const advisorApprove = new advisorApproves({
                studentId : email,
                advisorId : course[0].advisorId,
                courseId : course[0].courseId,
                status : 0
            })
            await approval.save();
            await advisorApprove.save();
            await instructorApprove.save();
            res.redirect("/studentEnroll");
        }
    });
})

route.get("/advisorPage", async (req, res) => {
    const username = req.session.username;
    const email = req.session.email;
    console.log("Dekh yha to aaya");
    if (typeof username == "undefined") {
        return res.status(400).send(
            '<p>Please Login first</p><a href = "/">Login now</a>'
        );
    }else{
        const advisorApproves = require(path.join(__dirname, '../db/advisorApprovalSchema'))
        advisorApproves.find({advisorId : email, status : 0}, async(err, approved)=>{
            if(err){
                console.log(err);
            }else{
                res.render("advisorPage", {
                    username : username, 
                    approved : approved,
                });
            }
        })
    }
})



route.get("/adapprove/:_id", async (req, res) => {
    const email = req.session.email;
    const {_id} = req.params ;
    const advisorApproves = require(path.join(__dirname, '../db/advisorApprovalSchema'))
    const approvals = require(path.join(__dirname, '../db/approvals.js'));
    advisorApproves.findOne({_id : _id}, async(err, recordData)=>{
        if(err){
            console.log(err);
        }else{
            console.log(recordData);
            const stid  = recordData.studentId ;
            const cid = recordData.courseId ;
            console.log(stid);
            console.log(cid);
            approvals.findOneAndUpdate({studentId : stid, courseId : cid}, {approvalByAdvisor : 1}, {upsert : true}, function(err, doc) {
                if (err) return res.send(500, {error: err});
                return res.send('Succesfully saved.');
            });
            recordData.status = 1 ;

        }
    })  
})
route.get("/addisapprove/:_id", async (req, res) => {
    
})

module.exports = route;