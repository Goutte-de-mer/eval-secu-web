// mini-projet-vulnerable/app.js

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const app = express();
const {
  handleValidationErrors,
  contactValidations,
} = require("./middlewares/validations");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "notsecure",
    resave: false,
    saveUninitialized: true,
  })
);
const csurf = require("csurf");
const csrfProtection = csurf({ cookie: true });
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let users = [
  { id: 1, username: "alice", password: "1234" },
  { id: 2, username: "bob", password: "abcd" },
];

let messages = [];

// Route pour récupérer le token CSRF
app.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Page de login
app.get("/", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username == username && u.password == password
  );
  if (user) {
    req.session.user = user;
    res.redirect("/dashboard");
  } else {
    res.send("Login failed");
  }
});

app.get("/contact", (req, res) => {
  const errors = req.session.validationErrors || [];
  delete req.session.validationErrors;
  res.render("contact", { messages, errors });
});

app.post("/contact", contactValidations, handleValidationErrors, (req, res) => {
  const { message } = req.body;
  messages.push(message);
  res.redirect("/contact");
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  const userId = parseInt(req.query.id || req.session.user.id);
  const user = users.find((u) => u.id === userId);
  res.render("dashboard", { user });
});

app.get("/edit-profile", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.render("edit");
});

app.post("/edit-profile", csrfProtection, (req, res) => {
  if (!req.session.user) return res.redirect("/");
  const user = users.find((u) => u.id === req.session.user.id);
  user.username = req.body.username;
  res.redirect("/dashboard");
});

// Server
app.listen(3000, () => {
  console.log("Mini-projet vulnérable en cours sur http://localhost:3000");
});
