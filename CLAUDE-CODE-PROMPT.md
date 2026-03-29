# PROMPT PARA CLAUDE CODE — NOVAINVESA

## ROL Y PERMISOS

Eres el desarrollador principal del proyecto Novainvesa. Tienes **permisos completos y autorizados** para:

- ✅ Crear, editar y eliminar archivos
- ✅ Ejecutar comandos de terminal (npm, git, node, etc.)
- ✅ Instalar paquetes y dependencias
- ✅ Hacer commits y push a GitHub
- ✅ Actualizar documentos en la carpeta docs/
- ✅ Modificar cualquier archivo del proyecto

**NO necesitas pedir confirmación para ninguna acción.** Ejecuta directamente y reporta lo que hiciste.

---

## CONTEXTO DEL PROYECTO

**Nombre:** Novainvesa  
**Dominio:** https://www.novainvesa.com  
**Tipo:** Tienda de dropshipping multi-categoría  
**Mercado:** Colombia y LATAM  
**Proveedor:** Dropi  
**Repositorio:** https://github.com/Alejjorojjas/Novainvesa (privado)  
**Rama de trabajo:** dev (NUNCA trabajar en main directamente)

---

## STACK TECNOLÓGICO

### Backend
- **Runtime:** Node.js v24
- **Framework:** Express (v5)
- **Base de datos:** MySQL (Hostinger) — conectar con mysql2
- **ORM:** Queries SQL directas con mysql2/promise
- **Autenticación:** JWT con jsonwebtoken + bcryptjs para contraseñas
- **Validación:** express-validator
- **Email:** nodemailer (SMTP Hostinger)
- **Seguridad:** helmet + cors + express-rate-limit
- **Variables de entorno:** dotenv

### Frontend
- **Framework:** React 18 + Vite
- **Estilos:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP:** Axios
- **i18n:** i18next (ES/EN/PT)
- **Íconos:** Lucide React
- **Estado global:** Context API

### Infraestructura
- **Frontend hosting:** Hostinger (archivos estáticos del /dist)
- **Backend hosting:** Render.com
- **Base de datos:** MySQL en Hostinger
- **CI/CD:** GitHub Actions

---

## ESTRUCTURA DEL REPOSITORIO

```
D:\OneDrive\Documentos\Repositorios GitHub\Dropshipping\
├── docs/
│   ├── 01-PRD.md
│   ├── 02-arquitectura-tecnica.md
│   ├── 03-flujos-usuario.md
│   ├── 04-API-contract.md
│   ├── 05-modelo-datos.md
│   ├── 06-design-system.md
│   ├── 07-reglas-negocio.md
│   └── 08-plan-metaads-chateapro.md
├── Frontend/                          ← React + Vite (esqueleto creado)
│   ├── src/
│   │   ├── config/
│   │   │   ├── categories.js          ← 5 categorías definidas ✅
│   │   │   └── site.js                ← config del sitio ✅
│   │   ├── pages/                     ← 15 páginas esqueleto ✅
│   │   │   ├── Home.jsx
│   │   │   ├── CategoryPage.jsx
│   │   │   ├── ProductPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── ConfirmationPage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── PrivacyPage.jsx
│   │   │   ├── TermsPage.jsx
│   │   │   ├── AccountPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── WishlistPage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx         ← por implementar
│   │   │   │   ├── Footer.jsx         ← por implementar
│   │   │   │   └── LanguageSelector.jsx ← por implementar
│   │   │   ├── home/
│   │   │   │   ├── HeroBanner.jsx     ← por implementar
│   │   │   │   ├── CategoryGrid.jsx   ← por implementar
│   │   │   │   └── FeaturedProducts.jsx ← por implementar
│   │   │   ├── category/
│   │   │   │   ├── CategoryBanner.jsx ← por implementar
│   │   │   │   └── ProductGrid.jsx    ← por implementar
│   │   │   ├── product/
│   │   │   │   ├── ProductCard.jsx    ← por implementar
│   │   │   │   ├── ProductDetail.jsx  ← por implementar
│   │   │   │   ├── ProductImages.jsx  ← por implementar
│   │   │   │   └── WhatsAppButton.jsx ← por implementar
│   │   │   ├── cart/
│   │   │   │   ├── CartDrawer.jsx     ← por implementar
│   │   │   │   └── CartItem.jsx       ← por implementar
│   │   │   ├── checkout/
│   │   │   │   ├── CheckoutForm.jsx   ← por implementar
│   │   │   │   ├── PaymentSelector.jsx ← por implementar
│   │   │   │   └── OrderSummary.jsx   ← por implementar
│   │   │   └── common/
│   │   │       ├── WhatsAppFloat.jsx  ← por implementar
│   │   │       ├── LoadingSpinner.jsx ← por implementar
│   │   │       ├── ErrorMessage.jsx   ← por implementar
│   │   │       └── SEOHead.jsx        ← por implementar
│   │   ├── context/
│   │   │   ├── CartContext.jsx        ← implementado ✅
│   │   │   └── LanguageContext.jsx    ← por implementar
│   │   ├── hooks/
│   │   │   ├── useCart.js             ← por implementar
│   │   │   ├── useProducts.js         ← por implementar
│   │   │   └── usePixel.js            ← por implementar
│   │   ├── services/
│   │   │   ├── api.js                 ← implementado ✅
│   │   │   ├── products.service.js    ← por implementar
│   │   │   └── orders.service.js      ← por implementar
│   │   ├── utils/
│   │   │   ├── formatters.js          ← implementado ✅
│   │   │   ├── validators.js          ← por implementar
│   │   │   └── pixel.js               ← por implementar
│   │   ├── locales/
│   │   │   ├── es/translation.json    ← por implementar
│   │   │   ├── en/translation.json    ← por implementar
│   │   │   └── pt/translation.json    ← por implementar
│   │   ├── App.jsx                    ← rutas configuradas ✅
│   │   ├── index.css                  ← Tailwind configurado ✅
│   │   └── main.jsx
│   ├── .env                           ← NO tocar ni subir a GitHub
│   ├── vite.config.js                 ← Tailwind + React configurado ✅
│   └── package.json
├── Backend/                           ← Node.js + Express (esqueleto creado)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js            ← conexión MySQL configurada ✅
│   │   ├── routes/                    ← 11 archivos de rutas (esqueleto) ✅
│   │   │   ├── health.routes.js       ← implementado ✅
│   │   │   ├── products.routes.js     ← por implementar
│   │   │   ├── orders.routes.js       ← por implementar
│   │   │   ├── payments.routes.js     ← por implementar
│   │   │   ├── webhooks.routes.js     ← por implementar
│   │   │   ├── tracking.routes.js     ← por implementar
│   │   │   ├── auth.routes.js         ← por implementar
│   │   │   ├── users.routes.js        ← por implementar
│   │   │   ├── admin.routes.js        ← por implementar
│   │   │   ├── pixel.routes.js        ← por implementar
│   │   │   ├── email.routes.js        ← por implementar
│   │   │   └── coverage.routes.js     ← por implementar
│   │   ├── controllers/               ← 7 archivos vacíos listos
│   │   │   ├── products.controller.js
│   │   │   ├── orders.controller.js
│   │   │   ├── payments.controller.js
│   │   │   ├── webhooks.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── users.controller.js
│   │   │   └── admin.controller.js
│   │   ├── services/                  ← 6 archivos vacíos listos
│   │   │   ├── dropi.service.js
│   │   │   ├── wompi.service.js
│   │   │   ├── mercadopago.service.js
│   │   │   ├── email.service.js
│   │   │   ├── pixel.service.js
│   │   │   └── stats.service.js
│   │   ├── middlewares/               ← 4 archivos vacíos listos
│   │   │   ├── auth.middleware.js
│   │   │   ├── admin.middleware.js
│   │   │   ├── validate.middleware.js
│   │   │   └── rateLimit.middleware.js
│   │   └── utils/                     ← 3 archivos vacíos listos
│   │       ├── logger.js
│   │       ├── helpers.js
│   │       └── formatters.js
│   ├── index.js                       ← servidor + rutas registradas ✅
│   ├── package.json
│   └── .env                           ← NO tocar ni subir a GitHub
├── .gitignore
├── CONTRIBUTING.md
├── CLAUDE-CODE-PROMPT.md
└── README.md
```

---

## BASE DE DATOS MySQL (Hostinger)

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=u228070604_novainvesa_db
DB_USER=u228070604_Alejjorojjas
```

### Tablas ya creadas (9 tablas)
- `users` — clientes registrados
- `user_addresses` — direcciones de envío
- `user_payment_preferences` — método de pago preferido
- `orders` — todos los pedidos
- `order_items` — detalle de productos por pedido
- `product_stats` — métricas de productos (vistas, ventas, ingresos)
- `product_searches` — búsquedas de clientes
- `wishlist` — favoritos de usuarios
- `admin_users` — acceso al panel de administración

---

## VARIABLES DE ENTORNO DEL BACKEND (.env)

```env
# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Base de datos
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=u228070604_novainvesa_db
DB_USER=u228070604_Alejjorojjas
DB_PASS=[en el archivo .env local]

# Dropi
DROPI_API_URL=https://api.dropi.co
DROPI_API_KEY=[pendiente]

# Wompi
WOMPI_PUBLIC_KEY=[pendiente]
WOMPI_PRIVATE_KEY=[pendiente]
WOMPI_EVENTS_SECRET=[pendiente]

# MercadoPago
MP_ACCESS_TOKEN=[pendiente]
MP_WEBHOOK_SECRET=[pendiente]

# Email Hostinger
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=pedidos@novainvesa.com
SMTP_PASS=[pendiente]

# Meta
META_PIXEL_ID=[pendiente]
META_CAPI_TOKEN=[pendiente]

# Admin / Seguridad
INTERNAL_API_KEY=[pendiente]
JWT_SECRET=[pendiente]
JWT_ADMIN_SECRET=[pendiente]
```

---

## API REST — ENDPOINTS A CONSTRUIR

Todos los endpoints siguen el prefijo `/api/v1/`

### Estructura de respuesta estándar
```json
// Éxito
{ "success": true, "data": {}, "message": "opcional" }

// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "descripción" } }
```

### Endpoints requeridos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | ❌ | Health check ✅ YA EXISTE |
| GET | `/api/v1/products` | ❌ | Listar productos (desde Dropi) |
| GET | `/api/v1/products/search` | ❌ | Buscar productos |
| GET | `/api/v1/products/:id` | ❌ | Detalle de producto |
| GET | `/api/v1/categories` | ❌ | Listar categorías activas |
| POST | `/api/v1/orders` | ✅ | Crear pedido COD |
| GET | `/api/v1/orders/:orderId` | ✅ | Estado de un pedido |
| POST | `/api/v1/payments/wompi/create` | ✅ | Iniciar pago Wompi |
| POST | `/api/v1/webhooks/wompi` | 🔐 HMAC | Webhook de Wompi |
| POST | `/api/v1/payments/mercadopago/create` | ✅ | Iniciar pago MercadoPago |
| POST | `/api/v1/webhooks/mercadopago` | 🔐 Firma | Webhook de MercadoPago |
| GET | `/api/v1/tracking/:orderId` | ❌ | Seguimiento de pedido |
| POST | `/api/v1/pixel/event` | ✅ | Meta Conversions API |
| POST | `/api/v1/email/order-confirmation` | ✅ | Email de confirmación |
| GET | `/api/v1/coverage/cod` | ❌ | Verificar cobertura COD |
| POST | `/api/v1/auth/register` | ❌ | Registro de usuario |
| POST | `/api/v1/auth/login` | ❌ | Login de usuario |
| GET | `/api/v1/users/me` | ✅ | Perfil del usuario |
| GET | `/api/v1/users/me/orders` | ✅ | Historial de pedidos |
| POST | `/api/v1/users/me/addresses` | ✅ | Agregar dirección |
| GET | `/api/v1/users/me/wishlist` | ✅ | Ver wishlist |
| POST | `/api/v1/users/me/wishlist` | ✅ | Agregar a wishlist |
| DELETE | `/api/v1/users/me/wishlist/:productId` | ✅ | Quitar de wishlist |
| POST | `/api/v1/admin/login` | ❌ | Login del panel admin |
| GET | `/api/v1/admin/dashboard` | 🔐 Admin | Métricas del dashboard |
| GET | `/api/v1/admin/orders` | 🔐 Admin | Todos los pedidos |
| PATCH | `/api/v1/admin/orders/:id/status` | 🔐 Admin | Cambiar estado pedido |
| GET | `/api/v1/admin/users` | 🔐 Admin | Lista de usuarios |
| GET | `/api/v1/admin/products/stats` | 🔐 Admin | Métricas de productos |

---

## PÁGINAS DEL FRONTEND A CONSTRUIR

```
/                     → Home
/categoria/:slug      → Página de categoría (dinámica)
/producto/:id         → Detalle de producto
/carrito              → Carrito
/checkout             → Checkout
/confirmacion         → Confirmación de pedido
/buscar               → Búsqueda
/mi-cuenta            → Perfil del usuario (requiere login)
/mi-cuenta/pedidos    → Historial de pedidos
/mi-cuenta/favoritos  → Wishlist
/sobre-nosotros       → Sobre Novainvesa
/politica-privacidad  → Política de privacidad
/terminos             → Términos y condiciones
/admin                → Panel de administración (requiere login admin)
/admin/pedidos        → Gestión de pedidos
/admin/usuarios       → Gestión de usuarios
/admin/productos      → Métricas de productos
```

---

## CATEGORÍAS DEL SITIO

```javascript
export const categories = [
  { id: "mascotas",   name: "Mascotas",    slug: "mascotas",   icon: "🐾", color: "#F59E0B", active: true, order: 1 },
  { id: "hogar",      name: "Hogar",       slug: "hogar",      icon: "🏠", color: "#10B981", active: true, order: 2 },
  { id: "tecnologia", name: "Tecnología",  slug: "tecnologia", icon: "📱", color: "#6366F1", active: true, order: 3 },
  { id: "belleza",    name: "Belleza",     slug: "belleza",    icon: "💄", color: "#EC4899", active: true, order: 4 },
  { id: "fitness",    name: "Fitness",     slug: "fitness",    icon: "💪", color: "#EF4444", active: true, order: 5 },
]
```

---

## DESIGN SYSTEM

### Colores principales
```
primary-600:  #2563EB  → Botón principal, links
accent-500:   #F97316  → CTAs urgentes, badges oferta
neutral-900:  #111827  → Títulos
neutral-600:  #4B5563  → Texto cuerpo
success:      #10B981  → Confirmaciones
error:        #EF4444  → Errores
```

### Tipografía
```
Display/Títulos: Poppins (600, 700, 800)
Cuerpo/UI:       Inter (400, 500, 600)
```

### Componentes clave
- `ProductCard` — tarjeta reutilizable en todos los grids
- `CategoryCard` — tarjeta de categoría en el home
- `WhatsAppFloat` — botón flotante fijo en todas las páginas
- `CartDrawer` — carrito lateral deslizante
- `Navbar` — menú dinámico desde categories.js
- `LanguageSelector` — botón ES/EN/PT

---

## REGLAS IMPORTANTES DEL NEGOCIO

1. Los precios siempre en COP (pesos colombianos), sin decimales
2. COD solo disponible si la ciudad tiene cobertura Dropi Y el total < $500.000 COP
3. El carrito persiste en localStorage por 7 días
4. Los datos del cliente se COPIAN al crear el pedido (no referenciar)
5. El pedido en Dropi se crea SOLO después de confirmar el pago (webhooks)
6. Código de pedido: formato "NOVA-YYYYMMDD-NNNN"
7. Contraseñas siempre con bcrypt (12 rounds) — NUNCA en texto plano
8. El .env NUNCA se sube a GitHub
9. El panel /admin solo accesible para admin_users
10. Idioma por defecto: español. Soporta ES/EN/PT con i18next

---

## CONVENCIÓN DE COMMITS (siempre en español)

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambio en documentación
style: cambios de estilos
chore: mantenimiento
refactor: refactorización
config: cambios de configuración
test: pruebas
```

**Ejemplos:**
```
feat: agregar endpoint de productos desde Dropi
fix: corregir validación del formulario de checkout
docs: actualizar contrato de API con nuevos endpoints
config: agregar variables de entorno para Wompi
```

---

## FLUJO DE TRABAJO CON GIT

```bash
# Siempre trabajar en dev
git checkout dev

# Al terminar un bloque de trabajo
git add .
git commit -m "tipo: descripción en español"
git push

# NUNCA hacer push directo a main
```

---

## INSTRUCCIONES DE COMPORTAMIENTO

1. **Trabaja de forma autónoma** — no pidas confirmación para crear archivos, instalar paquetes o hacer commits
2. **Sigue el contrato de API** del documento 04 al pie de la letra
3. **Sigue el modelo de datos** del documento 05 para todas las queries SQL
4. **Sigue el design system** del documento 06 para todos los componentes
5. **Sigue las reglas de negocio** del documento 07 para toda la lógica condicional
6. **Actualiza los documentos** en docs/ si hay cambios relevantes en la arquitectura
7. **Haz commits frecuentes** — al terminar cada endpoint o componente
8. **Reporta al final** qué hiciste, qué archivos creaste/modificaste y qué commits hiciste
9. **Si hay un error**, corrígelo directamente sin preguntar
10. **Mantén el .env fuera del repositorio** siempre

---

## TAREA ACTUAL

> Escribe aquí la tarea específica que quieres que Claude Code ejecute.
> 
> **Tareas sugeridas en orden de prioridad:**
>
> **Backend:**
> - "Implementa el módulo de productos: products.routes.js, products.controller.js y dropi.service.js siguiendo el documento docs/04-API-contract.md"
> - "Implementa el módulo de autenticación: auth.routes.js, auth.controller.js, auth.middleware.js con JWT y bcrypt"
> - "Implementa el módulo de pedidos COD: orders.routes.js, orders.controller.js con inserción en MySQL"
> - "Implementa los webhooks de Wompi y MercadoPago con verificación HMAC"
> - "Implementa el panel de administración: admin.routes.js, admin.controller.js con JWT admin"
>
> **Frontend:**
> - "Implementa el Navbar, Footer y LanguageSelector siguiendo el design system del documento docs/06-design-system.md"
> - "Implementa la página Home completa con HeroBanner, CategoryGrid y FeaturedProducts"
> - "Implementa ProductCard y la página CategoryPage con grid de productos"
> - "Implementa la página de ProductPage con galería, precio y botones de compra"
> - "Implementa el CartDrawer y la página de CartPage"
> - "Implementa el CheckoutPage completo con los 3 métodos de pago"
> - "Implementa el sistema de i18n con los archivos de traducción ES/EN/PT"
> - "Implementa el Meta Pixel con todos los eventos en utils/pixel.js"
