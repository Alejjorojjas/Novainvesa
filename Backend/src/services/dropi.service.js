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
    timeout: 10000,
    ...rest,
  };

  console.log("[Dropi] request →", method.toUpperCase(), config.url);

  try {
    const res = await axios(config);
    console.log("[Dropi] request ←", res.status, config.url);
    return res;
  } catch (err) {
    const status = err.response?.status;
    console.error(
      "[Dropi] request error",
      method.toUpperCase(),
      config.url,
      "| status:",
      status,
      "| msg:",
      err.message,
    );

    if (err.response?.data) {
      console.error("[Dropi] error body:", JSON.stringify(err.response.data));
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

function mapProduct(p, full = false) {
  const base = {
    id: String(p.id),
    name: p.name || p.title,
    slug: p.slug || slugify(p.name || p.title || ""),
    category: p.category_slug || p.category || "",
    price: Math.round(p.price || p.sale_price || 0),
    currency: "COP",
    images: Array.isArray(p.images)
      ? p.images.map((img) =>
          typeof img === "string" ? img : img.url || img.src,
        )
      : [p.image].filter(Boolean),
    shortDescription: p.short_description || "",
    inStock: p.in_stock !== undefined ? p.in_stock : true,
    featured: p.featured || p.is_featured || false,
    dropiProductId: String(p.id),
  };

  if (!full) return base;

  return {
    ...base,
    description: p.description || "",
    compareAtPrice: p.compare_at_price
      ? Math.round(p.compare_at_price)
      : undefined,
    benefits: Array.isArray(p.benefits) ? p.benefits : [],
    weight: p.weight || null,
    relatedProducts: Array.isArray(p.related_products)
      ? p.related_products.map(String)
      : [],
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

// POST /api/v1/products/getproducts
async function getProducts({
  category,
  limit = 20,
  page = 1,
  featured = false,
} = {}) {
  const safeLimit = Math.min(Number(limit) || 20, 50);
  const safePage = Math.max(Number(page) || 1, 1);

  const startData = (safePage - 1) * safeLimit + 1;

  const body = {
    pageSize: safeLimit,
    startData,
    no_count: false,
    order_by: "id",
    order_type: "asc",
    keywords: "",
    category: category ? [category] : [],
    favorite: false,
    privated_product: false,
  };

  if (featured) body.featured = true;

  const response = await dropiRequest("POST", "/api/v1/products/getproducts", {
    data: body,
  });

  const res = response.data;

  const rawProducts = Array.isArray(res.objects)
    ? res.objects
    : Array.isArray(res.data)
      ? res.data
      : Array.isArray(res)
        ? res
        : [];

  const total = res.count || res.total || rawProducts.length;
  const totalPages = Math.ceil(total / safeLimit);

  return {
    products: rawProducts.map((p) => mapProduct(p, false)),
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
}

// GET /api/v1/products/:id
async function getProductById(id) {
  const response = await dropiRequest("GET", `/api/v1/products/${id}`);
  const body = response.data;
  const raw = body.data || body;

  if (!raw || !raw.id) return null;
  return mapProduct(raw, true);
}

// Búsqueda
async function searchProducts(query, limit = 20) {
  const safeLimit = Math.min(Number(limit) || 20, 50);

  const body = {
    pageSize: safeLimit,
    startData: 1,
    no_count: false,
    order_by: "id",
    order_type: "asc",
    keywords: query,
    category: [],
    favorite: false,
    privated_product: false,
  };

  const response = await dropiRequest("POST", "/api/v1/products/getproducts", {
    data: body,
  });

  const res = response.data;

  const rawProducts = Array.isArray(res.objects)
    ? res.objects
    : Array.isArray(res.data)
      ? res.data
      : Array.isArray(res)
        ? res
        : [];

  return {
    query,
    results: rawProducts.map((p) => mapProduct(p, false)),
    total: res.count || res.total || rawProducts.length,
  };
}

// COD Coverage
async function checkCodCoverage(city) {
  const response = await dropiRequest("GET", "/api/v1/logistic/cities");
  const body = response.data;

  const cities = Array.isArray(body.data)
    ? body.data
    : Array.isArray(body)
      ? body
      : [];

  const normalizedQuery = city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const match = cities.find((c) => {
    const cityName = (c.name || c.city || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return cityName === normalizedQuery;
  });

  return {
    city,
    codAvailable: match
      ? (match.cod_available ?? match.available ?? true)
      : false,
    estimatedDelivery: match?.estimated_delivery || "3-7 días hábiles",
  };
}

// Crear orden
async function createOrder(orderData) {
  const dropiPayload = {
    customer: {
      full_name: orderData.customer.fullName,
      id_number: orderData.customer.idNumber || "",
      email: orderData.customer.email,
      phone: orderData.customer.phone,
    },
    shipping_address: {
      country: orderData.shipping.country || "CO",
      department: orderData.shipping.department,
      city: orderData.shipping.city,
      address: orderData.shipping.address,
      neighborhood: orderData.shipping.neighborhood || "",
      notes: orderData.shipping.notes || "",
    },
    items: orderData.items.map((item) => ({
      product_id: item.dropiProductId || item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    })),
    payment_method: orderData.payment.method,
    reference: orderData.reference,
  };

  const response = await dropiRequest("POST", "/api/v1/orders/store", {
    data: dropiPayload,
  });

  const body = response.data;
  const data = body.data || body;

  return {
    dropiOrderId: String(data.id || data.order_id),
    status: data.status || "CREATED",
    estimatedDelivery: data.estimated_delivery || "3-7 días hábiles",
  };
}

// Estado orden
async function getOrderStatus(dropiOrderId) {
  const response = await dropiRequest("GET", `/api/v1/orders/${dropiOrderId}`);
  const body = response.data;
  return body.data || body;
}

module.exports = {
  getProducts,
  getProductById,
  searchProducts,
  checkCodCoverage,
  createOrder,
  getOrderStatus,
};
