
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const session = require("express-session");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors());
app.use(bodyParser.json());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

mongoose.connect("mongodb://localhost:27017/mern_db", {
  useNewUrlParser: true
});

const Adviser = mongoose.model("Adviser", {
  email: String,
  password: String,
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
});
const Student = mongoose.model("Student", {
  email: String,
  password: String,
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
});
const Instructor = mongoose.model("Instructor", {
  email: String,
  password: String,
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
});
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "r.patidar181001.2@gmail.com",
    pass: "lftnzmpgnyibshxl"
  }
});


app.get("/login", function(req, res) {

  res.sendFile(__dirname + "/login.html");
})

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
})

app.get("/success", function(req, res) {
  res.sendFile(__dirname + "/success.html");
})

app.get("/verify-otp", function(req, res) {
  res.sendFile(__dirname + "/verify-otp.html");
})

app.get("/logout", function(req, res) {
  res.sendFile(__dirname + "/logout.html");
})

app.post("/", async (req, res) => {
  const {
    email,
    password,
    option
  } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 1);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  req.session.otp = otp;
  req.session.email = email;
  req.session.hashedPassword = hashedPassword;
  req.session.option = option;

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

  res.redirect("/verify-otp");
});

app.post("/login", async (req, res) => {
  const {
    email,
    password,
    option
  } = req.body;

  if(option=="s")
  {
    const student = await Student.findOne({
      email
    });
    if (!student) return res.status(400).send({
      message: "Invalid email or password"
    });

    const isPasswordValid = bcrypt.compareSync(password, student.password);
    if (!isPasswordValid) return res.status(400).send({
      message: "Invalid email or password"
    });
    else
    {
      res.redirect("/logout");
    }
  }
  else if(option=="a")
  {
    const adviser = await Adviser.findOne({
      email
    });
    if (!adviser) return res.status(400).send({
      message: "Invalid email or password"
    });

    const isPasswordValid = bcrypt.compareSync(password, adviser.password);
    if (!isPasswordValid) return res.status(400).send({
      message: "Invalid email or password"
    });
    else
    {
      res.redirect("/logout");
    }
  }
  else if(option=="i")
  {
    const instructor = await Instructor.findOne({
      email
    });
    if (!instructor) return res.status(400).send({
      message: "Invalid email or password"
    });

    const isPasswordValid = bcrypt.compareSync(password, instructor.password);
    if (!isPasswordValid) return res.status(400).send({
      message: "Invalid email or password"
    });
    else
    {
      res.redirect("/logout");
    }
  }
  else
  {
    res.redirect("/login");
  }

});

app.post("/verify-otp", async (req, res) => {

  const {
    otpEntered
  } = req.body;
  const otp = req.session.otp;
  const email = req.session.email;
  const hashedPassword = req.session.hashedPassword;
  const option = req.session.option;

  if(option=="s")
  {
    if(otp==otpEntered)
    {
      const student = new Student({
        email,
        password: hashedPassword
      });
      await student.save();
      req.session.student = student;
      res.redirect("/login");
    }
    else return res.status(400).send({
      message: "Invalid email or password"
    });
  }
  else if(option=="i")
  {
    if(otp==otpEntered)
    {
      const instructor = new Instructor({
        email,
        password: hashedPassword
      });
      await instructor.save();
      req.session.instructor = instructor;
      res.redirect("/login");
    }
    else return res.status(400).send({
      message: "Invalid email or password"
    });
  }
  else if(option=="a")
  {
    if(otp==otpEntered)
    {
      const adviser = new Adviser({
        email,
        password: hashedPassword
      });
      await adviser.save();
      req.session.adviser = adviser;
      res.redirect("/login");
    }
    else return res.status(400).send({
      message: "Invalid email or password"
    });
  }

});

// app.get("/dashboard", (req, res) => {
//   if (!req.session.user) return res.status(401).send({ message: "Unauthorized" });
//   res.send({ message: "Welcome to the dashboard" });
// });
//
app.post("/logout", (req, res) => {
  // if (!req.session.user) return res.status(401).send({ message: "Unauthorized" });
  // user.isLoggedIn = false;
  req.session.destroy();
  // res.send({ message: "Logged out successfully" });
  res.redirect("/");
});

app.listen(3000, function() {
  console.log("server is running on port 3000");
})
