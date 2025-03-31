require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
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

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "MYSESSIONSECRET",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
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
      failureMessage: true,
    },
    async function (username, password, done) {
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
        return done(null, false, {
          message: "Incorrect username or password.",
        });
      }
      return done(null, user);
    }
  )
);

const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.send("unauthorized");
  }
  next();
};

app.use("/products", isAuthenticated, productsRouter);
app.use("/users", isAuthenticated, usersRouter);
app.use("/cart", isAuthenticated, cartRouter);
app.use("/orders", isAuthenticated, ordersRouter);

app.get("/unauthorized", (req, res) => {
  res.sendStatus(401);
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err); // Handle unexpected errors
    }
    if (!user) {
      // Send the error message from the `info` object to the client
      return res.status(401).json({ message: info.message });
    }
    req.session.user = { id: user.rows[0].id, username: user.rows[0].username };
    return res.status(200).send(JSON.stringify(req.session.id));
  })(req, res, next);
});

app.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy();
    res.status(200).json({ message: "Logged out." });
  });
});

app.post("/register", async (req, res) => {
  try {
    const { username, password, first_name, last_name } = req.body;
    if (!username || !password || !first_name || !last_name) {
      throw Error("Please fill out all fields");
    }
    const existingUser = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (existingUser.rows.length > 0) {
      throw Error("Username already exists");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await db.query(
      "INSERT INTO users (username, password, first_name, last_name, created_at) VALUES ($1, $2, $3, $4, now()) RETURNING *",
      [username, hashedPassword, first_name, last_name]
    );
    return res.status(201).json({ message: "User registered." });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

app.get("/", (req, res) => {
  res.send({ message: "hello" });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
