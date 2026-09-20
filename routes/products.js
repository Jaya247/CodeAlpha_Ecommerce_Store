const express = require("express");
const { readDB } = require("../models/db");

const router = express.Router();

// GET /api/products?category=&search=
router.get("/", (req, res) => {
  const { category, search } = req.query;
  const db = readDB();
  let products = db.products;

  if (category && category !== "All") {
    products = products.filter((p) => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  res.json(products);
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const db = readDB();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }
  res.json(product);
});

module.exports = router;
