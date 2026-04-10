const axios = require("axios");

const BASE_URL = "https://api.dropi.co";

// ─── TOKEN CACHE ─────────────────────────────────────────────────────────────
let _token = null;
let _expires = 0;

async function getToken() {
  const now = Date.now();

  if (_token && now < _expires) {
    return _token;
  }

  const email = process.env.DROPI_EMAIL;
  const password = process.env.DROPI_PASSWORD;

  const res = await axios.post(`${BASE_URL}/api/v1/login`, {
    email,
    password,
  });

  const token =
    res.data?.token || res.data?.data?.token || res.data?.access_token;

  if (!token) throw new Error("No se obtuvo token");

  _token = token;
  _expires = now + 55 * 60 * 1000;

  return token;
}

// ─── REQUEST ────────────────────────────────────────────────────────────────
async function dropiRequest(method, path, options = {}) {
  const token = await getToken();

  const config = {
    method,
    url: `${BASE_URL}${path}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 15000,
    ...options,
  };

  const res = await axios(config);
  return res.data;
}

// ─── COD COVERAGE ───────────────────────────────────────────────────────────
async function checkCodCoverage(cityName) {
  const city = cityName || "";

  try {
    const data = await dropiRequest("GET", `/api/v1/cities?search=${encodeURIComponent(city)}`);
    const cities = data.objects || data.data || [];
    const match = cities.find(
      (c) => c.name?.toLowerCase() === city?.toLowerCase() && c.cod_available !== false
    );

    if (!match) {
      return { codAvailable: false, city, estimatedDelivery: null };
    }

    const days =
      match.estimated_delivery_days ||
      match.delivery_days ||
      match.estimatedDeliveryDays;
    const estimatedDelivery = days ? `${days} días hábiles` : "2 a 5 días hábiles";

    return { codAvailable: true, city, estimatedDelivery };
  } catch {
    return { codAvailable: false, city, estimatedDelivery: null };
  }
}

// ─── ORDER ──────────────────────────────────────────────────────────────────
async function createOrder(orderData) {
  return await dropiRequest("POST", "/api/v1/orders/store", {
    data: orderData,
  });
}

async function getOrderStatus(dropiOrderId) {
  return await dropiRequest("GET", `/api/v1/orders/${dropiOrderId}`);
}

module.exports = {
  checkCodCoverage,
  createOrder,
  getOrderStatus,
};
