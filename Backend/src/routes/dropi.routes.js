const express = require("express");
const router = express.Router();

const { getProducts, createOrder } = require("../services/dropi.service");

// 🔹 GET productos
router.get("/products", async (req, res) => {
  try {
    const data = await getProducts();
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Test orden
router.get("/order-test", async (req, res) => {
  try {
    const data = await createOrder();
    res.json(data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
