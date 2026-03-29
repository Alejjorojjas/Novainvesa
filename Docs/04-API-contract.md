# Contrato de API
## Novainvesa | Tienda de Dropshipping Multi-Categoría
**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Estado:** Borrador  
**Documento:** 4 de 8

---

## 1. INTRODUCCIÓN

Este documento define todos los endpoints de la API REST del backend de Novainvesa. Es el contrato entre el frontend y el backend — cualquier cambio en estos endpoints debe actualizarse aquí primero antes de implementarse.

### Convenciones generales

| Elemento | Valor |
|---|---|
| Base URL producción | `https://api-novainvesa.onrender.com` |
| Base URL desarrollo | `http://localhost:3000` |
| Formato de datos | JSON |
| Autenticación interna | Header: `x-api-key: {INTERNAL_API_KEY}` |
| Prefijo de rutas | `/api/v1/` |
| Encoding | UTF-8 |
| Zona horaria | America/Bogota (UTC-5) |
| Dominio frontend | `https://www.novainvesa.com` |

### Códigos de respuesta HTTP

| Código | Significado |
|---|---|
| `200` | OK — solicitud exitosa |
| `201` | Created — recurso creado exitosamente |
| `400` | Bad Request — datos inválidos o faltantes |
| `401` | Unauthorized — API key inválida o ausente |
| `404` | Not Found — recurso no encontrado |
| `422` | Unprocessable Entity — validación fallida |
| `429` | Too Many Requests — rate limit excedido |
| `500` | Internal Server Error — error del servidor |

### Estructura de respuesta estándar

```json
// ✅ Respuesta exitosa
{
  "success": true,
  "data": { },
  "message": "Descripción opcional"
}

// ❌ Respuesta de error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error en español"
  }
}
```

### Códigos de error personalizados

| Código | Descripción |
|---|---|
| `VALIDATION_ERROR` | Campos inválidos o faltantes en el body |
| `PRODUCT_NOT_FOUND` | El producto no existe o está inactivo |
| `ORDER_NOT_FOUND` | El pedido no existe |
| `PAYMENT_FAILED` | El pago fue rechazado por la pasarela |
| `DROPI_ERROR` | Error al crear el pedido en Dropi |
| `INVALID_WEBHOOK` | Firma del webhook inválida |
| `COD_NOT_AVAILABLE` | Contra entrega no disponible en esa ciudad |
| `RATE_LIMIT_EXCEEDED` | Demasiadas solicitudes desde esta IP |

---

## 2. HEALTH CHECK

### `GET /api/health`

Verifica que el servidor esté activo. El frontend lo llama al cargar para hacer warm-up del cold start de Render.

**Autenticación:** No requerida

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-03-29T15:00:00.000Z",
    "uptime": 3600,
    "environment": "production"
  }
}
```

---

## 3. PRODUCTOS

### `GET /api/v1/products`

Retorna el listado de productos, opcionalmente filtrado por categoría.

**Autenticación:** No requerida

**Query params:**
| Parámetro | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `category` | string | No | — | Slug de categoría (`mascotas`, `hogar`, etc.) |
| `limit` | number | No | `20` | Cantidad de productos (máx: 50) |
| `page` | number | No | `1` | Número de página |
| `featured` | boolean | No | `false` | Solo productos destacados |

**Ejemplo:**
```
GET /api/v1/products?category=mascotas&limit=12&page=1
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "dropi_prod_001",
        "name": "Comedero automático para mascotas",
        "slug": "comedero-automatico-mascotas",
        "category": "mascotas",
        "price": 89900,
        "currency": "COP",
        "images": [
          "https://cdn.dropi.co/products/001/img1.jpg",
          "https://cdn.dropi.co/products/001/img2.jpg"
        ],
        "description": "Comedero automático con capacidad para 3kg...",
        "shortDescription": "Alimenta a tu mascota automáticamente",
        "inStock": true,
        "featured": true,
        "dropiProductId": "dropi_internal_001"
      }
    ],
    "pagination": {
      "total": 48,
      "page": 1,
      "limit": 12,
      "totalPages": 4,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### `GET /api/v1/products/:id`

Retorna el detalle completo de un producto por su ID.

**Autenticación:** No requerida

**Path params:**
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | string | ID del producto |

**Ejemplo:**
```
GET /api/v1/products/dropi_prod_001
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "dropi_prod_001",
      "name": "Comedero automático para mascotas",
      "slug": "comedero-automatico-mascotas",
      "category": "mascotas",
      "price": 89900,
      "compareAtPrice": 120000,
      "currency": "COP",
      "images": [
        "https://cdn.dropi.co/products/001/img1.jpg",
        "https://cdn.dropi.co/products/001/img2.jpg",
        "https://cdn.dropi.co/products/001/img3.jpg"
      ],
      "description": "Descripción larga del producto...",
      "shortDescription": "Alimenta a tu mascota automáticamente",
      "benefits": [
        "Capacidad para 3kg de alimento",
        "Programable hasta 4 comidas al día",
        "Fácil de limpiar"
      ],
      "inStock": true,
      "featured": true,
      "weight": 1.2,
      "dropiProductId": "dropi_internal_001",
      "relatedProducts": ["dropi_prod_002", "dropi_prod_003"]
    }
  }
}
```

**Respuesta 404:**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "El producto no existe o no está disponible"
  }
}
```

---

### `GET /api/v1/products/search`

Busca productos por texto en nombre y descripción.

**Autenticación:** No requerida

**Query params:**
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `q` | string | Sí | Texto a buscar (mín: 2 caracteres) |
| `limit` | number | No | Cantidad de resultados (default: 20) |

**Ejemplo:**
```
GET /api/v1/products/search?q=comedero
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "query": "comedero",
    "results": [ /* array de productos */ ],
    "total": 3
  }
}
```

---

## 4. CATEGORÍAS

### `GET /api/v1/categories`

Retorna todas las categorías activas con su conteo de productos.

**Autenticación:** No requerida

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "mascotas",
        "name": "Mascotas",
        "slug": "mascotas",
        "icon": "🐾",
        "color": "#F59E0B",
        "description": "Todo para tu mejor amigo",
        "productCount": 12,
        "active": true
      },
      {
        "id": "hogar",
        "name": "Hogar",
        "slug": "hogar",
        "icon": "🏠",
        "color": "#10B981",
        "description": "Organiza y transforma tu espacio",
        "productCount": 18,
        "active": true
      }
    ]
  }
}
```

---

## 5. PEDIDOS

### `POST /api/v1/orders`

Crea un nuevo pedido. Usado principalmente para pedidos COD (contra entrega). Los pedidos con pago online se crean automáticamente desde el webhook de la pasarela.

**Autenticación:** `x-api-key` requerida

**Body:**
```json
{
  "customer": {
    "fullName": "Juan Pérez García",
    "idNumber": "1234567890",
    "email": "juan@email.com",
    "phone": "3001234567"
  },
  "shipping": {
    "country": "CO",
    "department": "Cundinamarca",
    "city": "Bogotá",
    "address": "Calle 123 # 45-67",
    "neighborhood": "Chapinero",
    "notes": "Apartamento 301, timbre no funciona"
  },
  "items": [
    {
      "productId": "dropi_prod_001",
      "dropiProductId": "dropi_internal_001",
      "name": "Comedero automático para mascotas",
      "quantity": 1,
      "unitPrice": 89900,
      "currency": "COP"
    }
  ],
  "payment": {
    "method": "COD",
    "total": 89900,
    "currency": "COP"
  },
  "source": "web",
  "utmParams": {
    "source": "facebook",
    "medium": "paid",
    "campaign": "mascotas"
  }
}
```

**Validaciones:**
- `customer.fullName`: requerido, mín 3 caracteres
- `customer.email`: requerido, formato válido
- `customer.phone`: requerido, mín 10 dígitos
- `shipping.city`: requerido
- `shipping.address`: requerido
- `items`: requerido, mín 1 ítem
- `payment.method`: requerido, valores: `COD | WOMPI | MERCADOPAGO`

**Respuesta 201:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "nova_order_20260329_001",
      "dropiOrderId": "dropi_order_9876",
      "status": "CREATED",
      "customer": {
        "fullName": "Juan Pérez García",
        "email": "juan@email.com",
        "phone": "3001234567"
      },
      "total": 89900,
      "currency": "COP",
      "paymentMethod": "COD",
      "estimatedDelivery": "3-7 días hábiles",
      "createdAt": "2026-03-29T15:00:00.000Z"
    }
  },
  "message": "Pedido creado exitosamente"
}
```

**Respuesta 400 — COD no disponible:**
```json
{
  "success": false,
  "error": {
    "code": "COD_NOT_AVAILABLE",
    "message": "El pago contra entrega no está disponible para la ciudad: Leticia"
  }
}
```

---

### `GET /api/v1/orders/:orderId`

Retorna el detalle y estado actual de un pedido.

**Autenticación:** `x-api-key` requerida

**Path params:**
| Parámetro | Tipo | Descripción |
|---|---|---|
| `orderId` | string | ID interno del pedido (`nova_order_...`) |

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "nova_order_20260329_001",
      "dropiOrderId": "dropi_order_9876",
      "status": "SHIPPED",
      "trackingNumber": "TCC1234567890",
      "carrier": "TCC",
      "customer": {
        "fullName": "Juan Pérez García",
        "email": "juan@email.com",
        "phone": "3001234567"
      },
      "shipping": {
        "city": "Bogotá",
        "address": "Calle 123 # 45-67"
      },
      "items": [ /* productos del pedido */ ],
      "total": 89900,
      "currency": "COP",
      "paymentMethod": "COD",
      "estimatedDelivery": "2026-04-02",
      "createdAt": "2026-03-29T15:00:00.000Z",
      "updatedAt": "2026-03-30T08:00:00.000Z"
    }
  }
}
```

---

## 6. PAGOS — WOMPI

### `POST /api/v1/payments/wompi/create`

Crea una transacción en Wompi y retorna la URL de pago.

**Autenticación:** `x-api-key` requerida

**Body:**
```json
{
  "orderData": {
    "customer": { /* igual que en POST /orders */ },
    "shipping": { /* igual que en POST /orders */ },
    "items": [ /* igual que en POST /orders */ ],
    "total": 89900,
    "currency": "COP"
  },
  "redirectUrl": "https://www.novainvesa.com/confirmacion"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "wompiTransactionId": "wompi_txn_abc123",
    "checkoutUrl": "https://checkout.wompi.co/p/?public-key=...&currency=COP&amount-in-cents=8990000&reference=nova_order_...",
    "reference": "nova_order_20260329_001",
    "amountInCents": 8990000,
    "expiresAt": "2026-03-29T16:00:00.000Z"
  }
}
```

---

### `POST /api/v1/webhooks/wompi`

Recibe notificaciones de pago de Wompi. **Solo llamado por Wompi**, no por el frontend.

**Autenticación:** Verificación de firma HMAC-SHA256 con `WOMPI_EVENTS_SECRET`

**Body (enviado por Wompi):**
```json
{
  "event": "transaction.updated",
  "data": {
    "transaction": {
      "id": "wompi_txn_abc123",
      "status": "APPROVED",
      "reference": "nova_order_20260329_001",
      "amount_in_cents": 8990000,
      "currency": "COP",
      "payment_method_type": "PSE"
    }
  },
  "timestamp": 1743260400,
  "signature": {
    "checksum": "abc123...",
    "properties": ["transaction.id", "transaction.status", "transaction.amount_in_cents"]
  }
}
```

**Lógica interna al recibir `APPROVED`:**
1. Verificar firma HMAC del webhook
2. Buscar el pedido por `reference`
3. Crear pedido en Dropi API
4. Enviar email de confirmación al cliente
5. Actualizar estado del pedido a `CONFIRMED`

**Respuesta 200:**
```json
{ "received": true }
```

---

## 7. PAGOS — MERCADOPAGO

### `POST /api/v1/payments/mercadopago/create`

Crea una preferencia de pago en MercadoPago.

**Autenticación:** `x-api-key` requerida

**Body:**
```json
{
  "orderData": {
    "customer": { /* igual que en POST /orders */ },
    "shipping": { /* igual que en POST /orders */ },
    "items": [ /* igual que en POST /orders */ ],
    "total": 89900,
    "currency": "COP"
  }
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "preferenceId": "mp_pref_789xyz",
    "initPoint": "https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=...",
    "reference": "nova_order_20260329_002"
  }
}
```

---

### `POST /api/v1/webhooks/mercadopago`

Recibe notificaciones IPN de MercadoPago. **Solo llamado por MercadoPago**.

**Autenticación:** Verificación de firma con `MP_WEBHOOK_SECRET`

**Query params enviados por MP:**
```
POST /api/v1/webhooks/mercadopago?type=payment&data.id=123456789
```

**Lógica interna al recibir pago aprobado:**
1. Consultar el pago en la API de MercadoPago con el ID recibido
2. Verificar que el estado sea `approved`
3. Buscar el pedido por `external_reference`
4. Crear pedido en Dropi API
5. Enviar email de confirmación al cliente
6. Actualizar estado del pedido a `CONFIRMED`

**Respuesta 200:**
```json
{ "received": true }
```

---

## 8. TRACKING DE PEDIDOS

### `GET /api/v1/tracking/:orderId`

Retorna el estado de seguimiento de un pedido consultando Dropi en tiempo real.

**Autenticación:** No requerida (el orderId funciona como token implícito)

**Path params:**
| Parámetro | Tipo | Descripción |
|---|---|---|
| `orderId` | string | ID interno del pedido |

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "orderId": "nova_order_20260329_001",
    "status": "SHIPPED",
    "statusLabel": "Enviado",
    "statusDescription": "Tu paquete está en camino",
    "trackingNumber": "TCC1234567890",
    "carrier": "TCC",
    "estimatedDelivery": "2026-04-02",
    "timeline": [
      {
        "status": "CREATED",
        "label": "Pedido recibido",
        "timestamp": "2026-03-29T15:00:00.000Z",
        "completed": true
      },
      {
        "status": "PREPARING",
        "label": "En preparación",
        "timestamp": "2026-03-30T08:00:00.000Z",
        "completed": true
      },
      {
        "status": "SHIPPED",
        "label": "Enviado",
        "timestamp": "2026-03-30T14:00:00.000Z",
        "completed": true
      },
      {
        "status": "DELIVERED",
        "label": "Entregado",
        "timestamp": null,
        "completed": false
      }
    ]
  }
}
```

---

## 9. META CONVERSIONS API (Server-Side)

### `POST /api/v1/pixel/event`

Envía un evento al servidor de Meta Conversions API. Complementa el Pixel del navegador para mayor precisión en la atribución.

**Autenticación:** `x-api-key` requerida

**Body:**
```json
{
  "eventName": "Purchase",
  "eventTime": 1743260400,
  "userData": {
    "email": "juan@email.com",
    "phone": "3001234567",
    "firstName": "Juan",
    "lastName": "Pérez",
    "city": "bogota",
    "countryCode": "CO"
  },
  "customData": {
    "value": 89900,
    "currency": "COP",
    "orderId": "nova_order_20260329_001",
    "contents": [
      {
        "id": "dropi_prod_001",
        "quantity": 1,
        "itemPrice": 89900
      }
    ]
  },
  "eventSourceUrl": "https://www.novainvesa.com/confirmacion",
  "actionSource": "website"
}
```

**Eventos válidos para `eventName`:**
- `PageView`
- `ViewContent`
- `AddToCart`
- `InitiateCheckout`
- `Purchase`
- `Search`
- `Contact`

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "eventsReceived": 1,
    "facebookTrace": "trace_id_abc123"
  }
}
```

---

## 10. EMAIL

### `POST /api/v1/email/order-confirmation`

Envía el email de confirmación de pedido al cliente. Se llama internamente desde los webhooks de pago y al crear pedidos COD.

**Autenticación:** `x-api-key` requerida (uso interno del backend únicamente)

**Body:**
```json
{
  "to": "juan@email.com",
  "customerName": "Juan Pérez",
  "order": {
    "id": "nova_order_20260329_001",
    "items": [
      {
        "name": "Comedero automático para mascotas",
        "quantity": 1,
        "unitPrice": 89900,
        "image": "https://cdn.dropi.co/products/001/img1.jpg"
      }
    ],
    "total": 89900,
    "currency": "COP",
    "paymentMethod": "COD",
    "shipping": {
      "city": "Bogotá",
      "address": "Calle 123 # 45-67"
    },
    "estimatedDelivery": "3-7 días hábiles"
  }
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "messageId": "hostinger_msg_abc123",
    "sentTo": "juan@email.com"
  }
}
```

---

## 11. VERIFICACIÓN DE COBERTURA COD

### `GET /api/v1/coverage/cod`

Verifica si el pago contra entrega está disponible para una ciudad.

**Autenticación:** No requerida

**Query params:**
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `city` | string | Sí | Nombre de la ciudad |
| `department` | string | No | Departamento para mayor precisión |

**Ejemplo:**
```
GET /api/v1/coverage/cod?city=Bogotá&department=Cundinamarca
```

**Respuesta 200 — COD disponible:**
```json
{
  "success": true,
  "data": {
    "city": "Bogotá",
    "codAvailable": true,
    "estimatedDelivery": "2-4 días hábiles"
  }
}
```

**Respuesta 200 — COD no disponible:**
```json
{
  "success": true,
  "data": {
    "city": "Leticia",
    "codAvailable": false,
    "message": "El pago contra entrega no está disponible para esta ciudad",
    "availablePaymentMethods": ["WOMPI", "MERCADOPAGO"]
  }
}
```

---

## 12. RESUMEN DE TODOS LOS ENDPOINTS

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | ❌ | Health check del servidor |
| GET | `/api/v1/products` | ❌ | Listar productos |
| GET | `/api/v1/products/search` | ❌ | Buscar productos |
| GET | `/api/v1/products/:id` | ❌ | Detalle de un producto |
| GET | `/api/v1/categories` | ❌ | Listar categorías activas |
| POST | `/api/v1/orders` | ✅ | Crear pedido (COD) |
| GET | `/api/v1/orders/:orderId` | ✅ | Estado de un pedido |
| POST | `/api/v1/payments/wompi/create` | ✅ | Iniciar pago Wompi |
| POST | `/api/v1/webhooks/wompi` | 🔐 HMAC | Webhook de Wompi |
| POST | `/api/v1/payments/mercadopago/create` | ✅ | Iniciar pago MercadoPago |
| POST | `/api/v1/webhooks/mercadopago` | 🔐 Firma | Webhook de MercadoPago |
| GET | `/api/v1/tracking/:orderId` | ❌ | Seguimiento de pedido |
| POST | `/api/v1/pixel/event` | ✅ | Enviar evento a Meta CAPI |
| POST | `/api/v1/email/order-confirmation` | ✅ | Email de confirmación |
| GET | `/api/v1/coverage/cod` | ❌ | Verificar cobertura COD |

**Leyenda:**
- ❌ Sin autenticación — endpoint público
- ✅ Requiere header `x-api-key`
- 🔐 Verificación criptográfica (HMAC / Firma de la pasarela)

---

## 13. RATE LIMITING

| Grupo de endpoints | Límite | Ventana |
|---|---|---|
| Endpoints públicos (GET) | 200 req | por IP / 15 minutos |
| Endpoints autenticados (POST) | 60 req | por IP / 15 minutos |
| Webhooks | Sin límite | — (vienen de IPs de pasarelas) |
| `/api/v1/orders` (crear pedido) | 10 req | por IP / hora |

---

## 14. CORS

Solo se aceptan requests desde los siguientes orígenes:

```javascript
const allowedOrigins = [
  'https://www.novainvesa.com',
  'http://localhost:5173',  // Vite dev server
  'http://localhost:3000'   // Backend local
]
```

---

*Documento vivo — versión 1.0*  
*Documento anterior: Flujos de Usuario (3 de 8) | Próximo: Modelo de Datos (5 de 8)*
