const axios = require("axios");

const BASE_URL = "https://api.dropi.co";

// ─── Axios wrapper ────────────────────────────────────────────────────────────
async function dropiRequest(method, path, options = {}) {
  const token = process.env.DROPI_INTEGRATION_TOKEN;

  if (!token) {
    throw new Error("DROPI_INTEGRATION_TOKEN es requerido");
  }

  const { headers: extraHeaders = {}, ...rest } = options;

  const config = {
    method,
    url: `${BASE_URL}${path}`,
    headers: {
      "dropi-integracion-key": token,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    timeout: 15000,
    ...rest,
  };

  console.log("[Dropi] request →", method.toUpperCase(), config.url);

  try {
    const res = await axios(config);
    console.log("[Dropi] request ←", res.status);
    return res;
  } catch (err) {
    const status = err.response?.status;

    console.error(
      "[Dropi] ERROR →",
      method,
      config.url,
      "| status:",
      status,
      "| msg:",
      err.message,
    );

    if (err.response?.data) {
      console.error("[Dropi] BODY:", JSON.stringify(err.response.data));
    }

    throw err;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function mapProduct(p) {
  return {
    id: String(p.id),
    name: p.name,
    slug: slugify(p.name),
    price: Math.round(p.price || 0),
    currency: "COP",
    images: p.images || [],
    description: p.description || "",
    inStock: p.stock > 0,
    dropiProductId: String(p.id),
  };
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

// GET /api/integration/products
async function getProducts({ limit = 20, page = 1 } = {}) {
  const safeLimit = Math.min(Number(limit) || 20, 50);
  const safePage = Math.max(Number(page) || 1, 1);

  const response = await dropiRequest(
    "GET",
    `/api/integration/products?page=${safePage}&limit=${safeLimit}`,
  );

  const data = response.data?.data || response.data || [];

  return {
    products: data.map(mapProduct),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: data.length,
      totalPages: 1, // Dropi integration no siempre devuelve total real
    },
  };
}

// GET /api/integration/products/:id
async function getProductById(id) {
  const response = await dropiRequest("GET", `/api/integration/products/${id}`);

  const data = response.data?.data || response.data;

  if (!data) return null;

  return mapProduct(data);
}

// búsqueda básica local (Dropi no siempre soporta search)
async function searchProducts(query, limit = 20) {
  const { products } = await getProducts({ limit });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  return {
    query,
    results: filtered,
    total: filtered.length,
  };
}

// ─── CIUDADES / COD ──────────────────────────────────────────────────────────

// GET /api/integration/cities
async function checkCodCoverage(city) {
  const response = await dropiRequest("GET", "/api/integration/cities");

  const cities = response.data?.data || response.data || [];

  const normalizedQuery = city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const match = cities.find((c) => {
    const name = (c.name || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return name === normalizedQuery;
  });

  return {
    city,
    codAvailable: match ? match.cod : false,
    estimatedDelivery: "3-7 días hábiles",
  };
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

// POST /api/integration/orders
async function createOrder(orderData) {
  const payload = {
    customer: {
      name: orderData.customer.fullName,
      phone: orderData.customer.phone,
      email: orderData.customer.email,
    },
    shipping: {
      city: orderData.shipping.city,
      address: orderData.shipping.address,
    },
    products: orderData.items.map((item) => ({
      id: item.dropiProductId,
      quantity: item.quantity,
    })),
    payment_method: orderData.payment.method || "COD",
  };

  const response = await dropiRequest("POST", "/api/integration/orders", {
    data: payload,
  });

  const data = response.data?.data || response.data;

  return {
    dropiOrderId: String(data.id),
    status: data.status || "CREATED",
  };
}

// GET /api/integration/orders/:id
async function getOrderStatus(orderId) {
  const response = await dropiRequest(
    "GET",
    `/api/integration/orders/${orderId}`,
  );

  return response.data?.data || response.data;
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

module.exports = {
  getProducts,
  getProductById,
  searchProducts,
  checkCodCoverage,
  createOrder,
  getOrderStatus,
};
