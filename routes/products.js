const router = require("express").Router();
const db = require("../db/index");

router.get("/", async (req, res) => {
  let categories = req.query.category;
  let products;
  if (categories === undefined) {
    products = await db.query("SELECT * FROM product");
  } else {
    categories = new Array(categories.split(","));
    products = await db.query(
      "SELECT * FROM product WHERE category_id = ANY ($1)",
      [categories]
    );
  }
  res.json(products.rows);
});

router.get("/:id", async (req, res) => {
  const product = await db.query("SELECT * FROM product WHERE id = $1", [
    req.params.id,
  ]);
  res.json(product.rows);
});

module.exports = router;
