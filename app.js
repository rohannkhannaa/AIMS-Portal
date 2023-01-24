const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const ejs = require("ejs");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const app = express();
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended : true
}));
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.json());


app.use('/', require(__dirname + '/routes/homePage'));
// app.use(path.join(__dirname ,'routes/home'), homepagee);


mongoose.connect('mongodb://127.0.0.1:27017/mydb', {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log('connected');
  })
  .catch((e) => {
    console.log("Something went wrong", e);
  });



app.listen(3000, function(req, res){
    console.log("server is running on port 3000");
});