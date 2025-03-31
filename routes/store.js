const router = require("express").Router();
// const db = require("../db/index");

router.get("/", (req, res) => {
  res.sendStatus(200);
});
module.exports = router;
