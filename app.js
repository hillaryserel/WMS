const express = require("express");
const nodemailer = require("nodemailer");
const app = express();
const path = require("path");
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const _db = require("./config/db");
const indexRoutes = require("./routes/index");

_db.connectToServer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"))
app.use(express.static(path.join(__dirname, "public/")));
app.use(cookieParser());

app.use("/", indexRoutes);

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
  },
});

app.get("/contact", (req, res) => {
  res.render("common/forms/contactUs");
});

app.post("/send-message", async(req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
      return res.status(400).send("All fields are required.");
  }
  
  // send an email
try{
  await transporter.sendMail({
    from: `"${name}" <${email}>`,
    to: process.env.EMAIL_USER,
    subject: "New Contact Us Message",
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  });
  res.send("Message sent successfully!");
} catch (error) {
    console.error("Email error:", error);
    res.status(500).send("Error sending email.");
}
});

app.get("*", (req, res) => {
    res.render("404.ejs");
})


app.listen("3000", () => {
  console.log("Application is running successfully");
});

