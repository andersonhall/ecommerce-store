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
      "SELECT * FROM product p JOIN products_categories pc ON p.id = pc.product_id WHERE pc.category_id = ANY ($1)",
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

router.post("/", async (req, res) => {
  const { product_name, product_desc, sku, price, categories } = req.body;
  const product = await db.query("SELECT * FROM product WHERE sku = $1", [sku]);
  if (product.rows.length > 0) {
    return res.json({ msg: "Product already exists." });
  }
  const inventoryId = await db.query(
    "INSERT INTO product_inventory DEFAULT VALUES RETURNING id"
  );
  const newProductId = await db.query(
    "INSERT INTO product (product_name, product_desc, inventory_id, sku, price) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [product_name, product_desc, inventoryId.rows[0].id, sku, price]
  );
  if (categories.length > 0) {
    for (const category of categories) {
      let cat = await db.query("SELECT * FROM product_category WHERE id = $1", [
        category,
      ]);
      if (cat.rows.length > 0) {
        await db.query(
          "INSERT INTO products_categories (product_id, category_id) VALUES ($1, $2)",
          [newProductId.rows[0].id, category]
        );
      }
    }
  }
  res.json({ message: "Product created." });
});

module.exports = router;
