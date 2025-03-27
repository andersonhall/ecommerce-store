require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.SERVER_PORT;
const db = require("./db/index");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        const user = await db.query("SELECT * FROM users WHERE username = $1", [
          username,
        ]);
        if (user.rows.length === 0) {
          return done(null, false, {
            message: "Incorrect username or password.",
          });
        }
        const correctPassword = await bcrypt.compare(hashedPassword, password);
        if (!correctPassword) {
          return done(null, false, {
            message: "Incorrect username or password.",
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

app.use(passport.initialize());
// app.use(passport.session());

app.post("/register", async (req, res) => {
  try {
    const { username, password, first_name, last_name } = req.body;
    if (!username || !password || !first_name || !last_name) {
      return res.status(400).json({ message: "Please fill out all fields." });
    }
    const existingUser = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Username already exists.",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await db.query(
      "INSERT INTO users (username, password, first_name, last_name, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        username,
        hashedPassword,
        first_name,
        last_name,
        new Date().toISOString(),
      ]
    );
    return res.status(201).json({ message: "User registered." });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
