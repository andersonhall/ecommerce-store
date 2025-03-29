const router = require("express").Router();
const db = require("../db/index");

router.get("/", async (req, res) => {
  const users = await db.query(
    "SELECT id, username, first_name, last_name, created_at, modified_at FROM users"
  );
  res.json(users.rows);
});

router.get("/:id", async (req, res) => {
  const user = await db.query(
    "SELECT id, username, first_name, last_name, created_at, modified_at FROM users WHERE id = $1",
    [req.params.id]
  );
  res.json(user.rows[0]);
});

module.exports = router;
