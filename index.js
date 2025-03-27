require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.SERVER_PORT;
const db = require("./db/index");

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(() => {
  console.log(`App listening on port ${port}`);
});
