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

router.put("/:id", async (req, res) => {
  const { product_name, product_desc, sku, price, categories } = req.body;
  if (product_name !== undefined) {
    const newName = product_name;
    await db.query(
      "UPDATE product SET product_name = $1, modified_at = now() WHERE id = $2 AND product_name <> $1",
      [newName, req.params.id]
    );
  }
  if (product_desc !== undefined) {
    const newDesc = product_desc;
    await db.query(
      "UPDATE product SET product_desc = $1, modified_at = now() WHERE id = $2 AND product_desc <> $1",
      [newDesc, req.params.id]
    );
  }
  if (sku !== undefined) {
    const newSku = sku;
    await db.query(
      "UPDATE product SET sku = $1, modified_at = now() WHERE id = $2 AND sku <> $1",
      [newSku, req.params.id]
    );
  }
  if (price !== undefined) {
    const newPrice = price;
    await db.query(
      "UPDATE product SET price = $1, modified_at = now() WHERE id = $2 AND price <> $1",
      [newPrice, req.params.id]
    );
  }
  if (categories !== undefined) {
    const newCategories = categories;
    await db.query("DELETE FROM products_categories WHERE product_id = $1", [
      req.params.id,
    ]);
    for (const category of newCategories) {
      let cat = await db.query("SELECT * FROM product_category WHERE id = $1", [
        category,
      ]);
      if (cat.rows.length > 0) {
        await db.query(
          "INSERT INTO products_categories (product_id, category_id) VALUES ($1, $2)",
          [req.params.id, category]
        );
      }
    }
  }
  const product = await db.query("SELECT * FROM product WHERE id = $1", [
    req.params.id,
  ]);
  res.json({ message: "Product updated.", product: product.rows[0] });
});

router.delete("/:id", async (req, res) => {
  const productToDelete = await db.query(
    "SELECT * FROM product WHERE id = $1",
    [req.params.id]
  );
  if (productToDelete.rows.length === 0) {
    return res.json({ message: "Product with that ID doesn't exist." });
  }

  res.json({ message: "Product deleted." });
});

module.exports = router;
