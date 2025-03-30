require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.SERVER_PORT;
const db = require("./db/index");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const session = require("express-session");
const productsRouter = require("./routes/products");
const usersRouter = require("./routes/users");
const cartRouter = require("./routes/cart");
const ordersRouter = require("./routes/orders");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "MYSESSIONSECRET",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
  })
);
app.use(passport.session());
passport.serializeUser(async (user, done) => {
  done(null, user.rows[0].username);
});
passport.deserializeUser(async (username, done) => {
  await db.query(
    "SELECT * FROM users WHERE username = $1",
    [username],
    (err, user) => {
      done(err, user.rows[0]);
    }
  );
});
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
        const correctPassword = await bcrypt.compare(
          password,
          user.rows[0].password
        );
        if (!correctPassword) {
          console.log("not correct");
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

app.use("/products", productsRouter);
app.use("/users", usersRouter);
app.use("/cart", cartRouter);
app.use("/orders", ordersRouter);

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  (req, res) => {
    res.json({ user: req.user.rows[0], session: req.session });
  }
);

app.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ message: "Logged out.", session: req.session });
  });
});

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
