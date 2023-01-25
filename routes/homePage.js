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
const JWT_SECRET="randomsecret";
const jwt=require('jsonwebtoken')

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


route.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
})
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
                req.session.student = student[0];
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
                req.session.advisor = advisor[0];
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
                req.session.instructor = instructor[0];
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
        console.log(otp);
        const hashedPassword = bcrypt.hashSync(password, 1);
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
            req.session.student = newStudent;
            req.session.save();
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
            req.session.advisor = newAdvisor;
            req.session.save();
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
            req.session.instructor = newInstructor;
            req.session.save();
            req.session.email = newInstructor.email;
            req.session.save();
            res.redirect('/instructorPage');
        } else {
            res.send({ Error: "Invalid OTP" });
        }
    }
});


route.get("/studentPage", async (req, res) => {
    const student = req.session.student;
    const approvals = require(path.join(__dirname, '../db/approvals.js'));
    if (typeof student == 'undefined') {
        return res.status(400).send(
            '<p>Please Login first</p><a href = "/">Login now</a>'
        );
    }
    const username = student.username;
    const email = student.email;
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
    const student = req.session.student;
    const courses = require(path.join(__dirname, '../db/courseSchema.js'));
    if (typeof student == 'undefined') {
        return res.status(400).send(
            '<p>Please Login first</p><a href = "/">Login now</a>'
        );
    }
    const username = student.username;
    courses.find({}, function (err, courseList) {
        if (err) {
            console.log(err);
        } else {
            res.render("studentEnroll", {
                username: username,
                courseList: courseList
            });
        }
    })
});

route.get("/enroll/:_id", async (req, res) => {
    const email = req.session.student.email;
    const username = req.session.student.username;
    const { _id } = req.params;
    if (typeof username == 'undefined') {
        return res.status(400).send(
            '<p>Please Login first</p><a href = "/">Login now</a>'
        );
    }
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
                studentId: email,
                instructorId: course[0].instructorId,
                courseId: course[0].courseId,
                status: 0
            })
            const advisorApprove = new advisorApproves({
                studentId: email,
                advisorId: course[0].advisorId,
                courseId: course[0].courseId,
                status: 0
            })
            await approval.save();
            await advisorApprove.save();
            await instructorApprove.save();
            res.send("Requested !");
        }
    });
})

route.get("/advisorPage", async (req, res) => {
    const advisor = req.session.advisor;
    if (typeof advisor == "undefined") {
        return res.status(400).send(
            '<p>Please Login first</p><a href = "/">Login now</a>'
        );
    } else {
        const username = advisor.username;
        const email = advisor.email;
        const advisorApproves = require(path.join(__dirname, '../db/advisorApprovalSchema'))
        advisorApproves.find({ advisorId: email }, async (err, approved) => {
            if (err) {
                console.log(err);
            } else {
                res.render("advisorPage", {
                    username: username,
                    approved: approved,
                });
            }
        })
    }
})



route.get("/adapprove/:_id", async (req, res) => {
    const { _id } = req.params;
    const advisorApproves = require(path.join(__dirname, '../db/advisorApprovalSchema'))
    const approvals = require(path.join(__dirname, '../db/approvals.js'));
    advisorApproves.findOneAndUpdate({ _id: _id }, { status: 1 }, { upsert: true }, function (err, recordData) {
        if (err) {
            console.log(err);
        } else {
            console.log(recordData);
            const stid = recordData.studentId;
            const cid = recordData.courseId;
            console.log(stid);
            console.log(cid);
            approvals.findOneAndUpdate({ studentId: stid, courseId: cid }, { approvalByAdvisor: 1 }, { upsert: true }, function (err, doc) {
                if (err) return res.send(500, { error: err });
                return res.redirect('/advisorPage');
            });
        }
    })
})
route.get("/addisapprove/:_id", async (req, res) => {
    const { _id } = req.params;
    const advisorApproves = require(path.join(__dirname, '../db/advisorApprovalSchema'))
    const approvals = require(path.join(__dirname, '../db/approvals.js'));
    advisorApproves.findOneAndUpdate({ _id: _id }, { status: 2 }, { upsert: true }, function (err, recordData) {
        if (err) {
            console.log(err);
        } else {
            console.log(recordData);
            const stid = recordData.studentId;
            const cid = recordData.courseId;
            console.log(stid);
            console.log(cid);
            approvals.findOneAndUpdate({ studentId: stid, courseId: cid }, { approvalByAdvisor: 2 }, { upsert: true }, function (err, doc) {
                if (err) return res.send(500, { error: err });
                return res.redirect('/advisorPage');
            });
        }
    })
});

route.get("/instructorPage", async (req, res) => {
    const instructor = req.session.instructor;
    console.log("Dekh yha to aaya");
    if (typeof instructor == "undefined") {
        return res.status(400).send(
            '<p>Please Login first</p><a href = "/">Login now</a>'
        );
    } else {
        const email = instructor.email;
        const username = instructor.username;
        const instructorApproves = require(path.join(__dirname, '../db/instructorApprovalSchema'))
        instructorApproves.find({ instructorId: email }, async (err, approved) => {
            if (err) {
                console.log(err);
            } else {
                res.render("instructorPage", {
                    username: username,
                    approved: approved,
                });
            }
        })
    }
})



route.get("/inapprove/:_id", async (req, res) => {
    const { _id } = req.params;
    const instructorApproves = require(path.join(__dirname, '../db/instructorApprovalSchema'))
    const approvals = require(path.join(__dirname, '../db/approvals.js'));
    instructorApproves.findOneAndUpdate({ _id: _id }, { status: 1 }, { upsert: true }, function (err, recordData) {
        if (err) {
            console.log(err);
        } else {
            console.log(recordData);
            const stid = recordData.studentId;
            const cid = recordData.courseId;
            console.log(stid);
            console.log(cid);
            approvals.findOneAndUpdate({ studentId: stid, courseId: cid }, { approvalByInstructor: 1 }, { upsert: true }, function (err, doc) {
                if (err) return res.send(500, { error: err });
                return res.redirect("/instructorPage");
            });
        }
    })
})
route.get("/indisapprove/:_id", async (req, res) => {
    const email = req.session.email;
    const { _id } = req.params;
    const instructorApproves = require(path.join(__dirname, '../db/instructorApprovalSchema'))
    const approvals = require(path.join(__dirname, '../db/approvals.js'));
    instructorApproves.findOneAndUpdate({ _id: _id }, { status: 2 }, { upsert: true }, function (err, recordData) {
        if (err) {
            console.log(err);
        } else {
            console.log(recordData);
            const stid = recordData.studentId;
            const cid = recordData.courseId;
            console.log(stid);
            console.log(cid);
            approvals.findOneAndUpdate({ studentId: stid, courseId: cid }, { approvalByInstructor: 2 }, { upsert: true }, function (err, doc) {
                if (err) return res.send(500, { error: err });
                return res.redirect("/instructorPage");
            });
        }
    })
})


route.get('/forgot-password', (req,res) => {
  res.render("forgot-password");
})

route.post('/forgot-password', async(req,res) => {
  console.log(req.body);
  let email=req.body.email;
  let option=req.body.option;
  req.session.email=email;
  req.session.option=option;

  let found="";
  let link;
  //console.log("here");
  if(option=="s"){
    const students = require(path.join(__dirname, '../db/studentSchema.js'));
    const student = await students.findOne({email});
    if (!student) return res.status(400).send({
      message: "Invalid email"
    });
    req.session.id=student._id;
    const secret=JWT_SECRET + student.password;
    const payload= {
      email: student.email,
      id:student._id
    };
    const token = jwt.sign(payload, secret, {expiresIn:'15m'});
    link = `http://localhost:3000/reset-password/${student._id}/${token}`;
    //console.log(link);
    found="found";
    res.render("forgot-password-mail-sent");

  }else if(option=="a"){
    const advisers = require(path.join(__dirname, '../db/adviserSchema.js'));
    const adviser = await advisers.findOne({email});
    if (!adviser) return res.status(400).send({
      message: "Invalid email"
    });
    req.session.id=id;
    const secret=JWT_SECRET + adviser.password;
    const payload= {
      email: adviser.email,
      id:adviser._id
    };
    const token = jwt.sign(payload, secret, {expiresIn:'15m'});
    link = `http://localhost:3000/reset-password/${adviser._id}/${token}`;
    console.log(link);
    found="found";
    res.render("forgot-password-mail-sent");

  }else if(option=="i"){
    const instructors = require(path.join(__dirname, '../db/instructorSchema.js'));
    const instructor = await instructors.findOne({email});
    if (!instructor) return res.status(400).send({
      message: "Invalid email"
    });
    req.session.id=id;
    const secret=JWT_SECRET + instructor.password;
    const payload= {
      email: instructor.email,
      id:instructor._id
    };
    const token = jwt.sign(payload, secret, {expiresIn:'15m'});
    link = `http://localhost:3000/reset-password/${instructor._id}/${token}`;
    console.log(link);
    found="found";
    res.render("forgot-password-mail-sent");
  }
  if(found=="found"){
    const mailOptions = {
      from: "r.patidar181001.2@gmail.com",
      to: email,
      subject: "link for reset password",
      html: `<p>Reset you password using the link. It is only valid for 15 min.</p><a href=${link}>link</a>`
    };

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "r.patidar181001.2@gmail.com",
            pass: "lftnzmpgnyibshxl"
        }
    });
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send({
          message: "Failed to send link"
        });
      } else {
        console.log("sent sent sent")
        console.log("resetLink sent: " + info.response);
        res.send({
          message: "link resetlink"
        });
      }
    });
  }
})



route.get('/reset-password/:id/:token', async(req,res) => {
  // console.log(req.params);
  // console.log(req.session.option);
  const id=req.params.id;
  const option= req.session.option;
  const token=req.params.token;
  const link=`/reset-password/${id}/${token}`;

  if(option=='s'){
    const students = require(path.join(__dirname, '../db/studentSchema.js'));
    const student = await students.findOne({_id:id});
    if (!student) return res.status(400).send({
      message: "Invalid email"
    });
    // console.log(student);
    // console.log(student);
    const secret=JWT_SECRET + student.password;
    //console.log(secret);
    try{
      const payload = jwt.verify(token, secret);
      res.render("reset-password",{link:link});
    }catch(error){
      console.log(error);
      res.send(error);
    }



  } else if(option == "a"){
    const advisers = require(path.join(__dirname, '../db/adviserSchema.js'));
    const adviser = await advisers.findOne({_id:id});
    if (!adviser) return res.status(400).send({
      message: "Invalid email"
    });

    const secret=JWT_SECRET + adviser.password;
    try{
      const payload = jwt.verify(token, secret);
      res.render("reset-password",{link:link});
    }catch(error){
      console.log(error);
      res.send(error);
    }

  }else if(option == "i"){
    const instructors = require(path.join(__dirname, '../db/instructorSchema.js'));
    const instructor = await instructors.findOne({_id:id});
    if (!instructor) return res.status(400).send({
      message: "Invalid email"
    });

    const secret=JWT_SECRET + instructor.password;
    try{
      const payload = jwt.verify(token, secret);
      res.render("reset-password",{link:link});
    }catch(error){
      console.log(error);
      res.send(error);
    }

  }

})

route.post('/reset-password/:id/:token', async(req,res) => {
  console.log("i m here")
  const id=req.params.id;
  const option= req.session.option;
  const token=req.params.token;
  const {password, repassword}=req.body;

  if(option=='s'){
    const students = require(path.join(__dirname, '../db/studentSchema.js'));
    const student = await students.findOne({_id:id});
    if (!student) return res.status(400).send({
      message: "Invalid email"
    });
    // console.log(student);
    // console.log(student);
    const secret=JWT_SECRET + student.password;
    //console.log(secret);
    try{
      const payload = jwt.verify(token, secret);
      if(password==repassword){
        console.log("matched");
        const hashedPassword = bcrypt.hashSync(password, 1);
        const student = await students.updateOne({_id:id},{$set: {password:hashedPassword}})
        if (!student) return res.status(400).send({
          message: "Invalid email"
        });
      }
      res.render("reset-password-success");
    }catch(error){
      console.log(error);
      res.send(error);
    }



  } else if(option == "a"){
    const advisers = require(path.join(__dirname, '../db/adviserSchema.js'));
    const adviser = await advisers.findOne({_id:id});
    if (!adviser) return res.status(400).send({
      message: "Invalid email"
    });

    const secret=JWT_SECRET + adviser.password;
    try{
      const payload = jwt.verify(token, secret);
      if(password==repassword){
        const hashedPassword = bcrypt.hashSync(password, 1);
        const adviser = await advisers.updateOne({_id:id},{$set: {password:hashedPassword}})
        if (!adviser) return res.status(400).send({
          message: "Invalid email"
        });
      }
      res.render("reset-password-success");
    }catch(error){
      console.log(error);
      res.send(error);
    }

  }else if(option == "i"){
    const instructors = require(path.join(__dirname, '../db/instructorSchema.js'));
    const instructor = await instructors.findOne({_id:id});
    if (!instructor) return res.status(400).send({
      message: "Invalid email"
    });

    const secret=JWT_SECRET + instructor.password;
    try{
      const payload = jwt.verify(token, secret);
      if(password==repassword){
        const hashedPassword = bcrypt.hashSync(password, 1);
        const instructor = await instructors.updateOne({_id:id},{$set: {password:hashedPassword}})
        if (!instructor) return res.status(400).send({
          message: "Invalid email"
        });
      }
      res.render("reset-password-success");
    }catch(error){
      console.log(error);
      res.send(error);
    }

  }


})
module.exports = route;
