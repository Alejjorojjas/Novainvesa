# Arquitectura Técnica
## Novainvesa | Tienda de Dropshipping Multi-Categoría
**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Estado:** Borrador  
**Documento:** 2 de 8

---

## 1. VISIÓN GENERAL DE LA ARQUITECTURA

Novainvesa sigue una arquitectura **desacoplada en dos capas** (frontend + backend separados), optimizada para funcionar con hosting compartido (Hostinger) sin costos adicionales de servidor.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser / App)                  │
│                     React + Vite + Tailwind CSS                 │
│                      Hostinger — www.novainvesa.com                 │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / REST
┌────────────────────────────▼────────────────────────────────────┐
│                    BACKEND — API REST                           │
│                    Node.js + Express                            │
│                    Render.com (free tier)                       │
└──────┬───────────────┬──────────────┬────────────────┬──────────┘
       │               │              │                │
  ┌────▼────┐   ┌──────▼──────┐ ┌────▼────┐   ┌──────▼──────┐
  │  DROPI  │   │    WOMPI    │ │   MP    │   │   HOSTINGER │
  │   API   │   │   (Pagos)   │ │ (Pagos) │   │   (Email)   │
  └─────────┘   └─────────────┘ └─────────┘   └─────────────┘

       │
  ┌────▼──────────────────────────────────────────┐
  │           SERVICIOS EXTERNOS                  │
  │  Meta Pixel │ GA4 │ Chatea Pro (WhatsApp Bot) │
  └───────────────────────────────────────────────┘
```

---

## 2. STACK TECNOLÓGICO COMPLETO

### 2.1 Frontend
| Tecnología | Versión | Rol |
|---|---|---|
| React | 18.x | UI Library — base de toda la interfaz |
| Vite | 5.x | Build tool — compilación y dev server ultrarrápido |
| Tailwind CSS | 3.x | Estilos utilitarios — diseño responsive mobile-first |
| React Router v6 | 6.x | Navegación entre páginas (SPA) |
| i18next | 23.x | Internacionalización (ES / EN / PT) |
| Axios | 1.x | Peticiones HTTP al backend |
| Context API | (React) | Estado global del carrito y sesión |
| Meta Pixel SDK | Latest | Tracking de eventos para anuncios |
| GA4 (gtag.js) | Latest | Analytics de comportamiento |

### 2.2 Backend
| Tecnología | Versión | Rol |
|---|---|---|
| Node.js | 20.x LTS | Runtime del servidor |
| Express | 4.x | Framework HTTP — rutas y middlewares |
| Axios | 1.x | Peticiones a APIs externas (Dropi, etc.) |
| dotenv | 16.x | Gestión de variables de entorno |
| cors | 2.x | Control de acceso cross-origin |
| helmet | 7.x | Headers de seguridad HTTP |
| express-rate-limit | 7.x | Protección contra abuso de la API |
| nodemailer | 6.x | Envío de emails vía Hostinger SMTP |

### 2.3 Infraestructura
| Servicio | Uso | Costo |
|---|---|---|
| Hostinger | Frontend (archivos estáticos) + Email | Plan activo |
| Render.com | Backend Node.js | $0 (free tier) |
| GitHub | Control de versiones + CI/CD | $0 |
| GitHub Actions | Deploy automático al hacer push | $0 |

### 2.4 APIs y servicios externos
| Servicio | Uso | Autenticación |
|---|---|---|
| Dropi API | Crear pedidos, consultar estado | API Key |
| Wompi | Pagos PSE, Nequi, tarjetas | Public + Private Key |
| MercadoPago | Pagos Daviplata, tarjetas | Access Token |
| Meta Pixel | Tracking de conversiones | Pixel ID |
| Meta Conversions API | Server-side tracking | Access Token |
| Conversions API (CAPI) | Tracking desde el servidor | Token |
| Hostinger SMTP | Emails transaccionales | Usuario + Contraseña |
| Chatea Pro | Bot de WhatsApp | Webhook URL |

---

## 3. ESTRUCTURA DE CARPETAS

### 3.1 Repositorio completo
```
novainvesa/
├── frontend/                  ← React + Vite (desplegado en Hostinger)
├── backend/                   ← Node.js + Express (desplegado en Render)
├── docs/                      ← Documentos del proyecto (PRD, Arquitectura, etc.)
├── .gitignore
└── README.md
```

### 3.2 Frontend — estructura detallada
```
frontend/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── banners/               ← Imágenes de banners por categoría
│       ├── mascotas.jpg
│       ├── hogar.jpg
│       ├── tecnologia.jpg
│       ├── belleza.jpg
│       └── fitness.jpg
│
├── src/
│   ├── config/
│   │   ├── categories.js      ← 🎯 Config central de categorías (agregar aquí)
│   │   └── site.js            ← Nombre tienda, logo, redes, WhatsApp, contacto
│   │
│   ├── pages/
│   │   ├── Home.jsx           ← Página principal
│   │   ├── CategoryPage.jsx   ← /categoria/:slug — dinámica para todas
│   │   ├── ProductPage.jsx    ← /producto/:id — detalle de producto
│   │   ├── CartPage.jsx       ← /carrito
│   │   ├── CheckoutPage.jsx   ← /checkout
│   │   ├── ConfirmationPage.jsx ← /confirmacion (dispara Pixel Purchase)
│   │   ├── SearchPage.jsx     ← /buscar
│   │   ├── AboutPage.jsx      ← /sobre-nosotros
│   │   ├── PrivacyPage.jsx    ← /politica-privacidad
│   │   └── TermsPage.jsx      ← /terminos
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx     ← Menú dinámico desde categories.js
│   │   │   ├── Footer.jsx
│   │   │   └── LanguageSelector.jsx  ← Botón ES/EN/PT
│   │   │
│   │   ├── home/
│   │   │   ├── HeroBanner.jsx
│   │   │   ├── CategoryGrid.jsx
│   │   │   └── FeaturedProducts.jsx
│   │   │
│   │   ├── category/
│   │   │   ├── CategoryBanner.jsx
│   │   │   └── ProductGrid.jsx
│   │   │
│   │   ├── product/
│   │   │   ├── ProductCard.jsx       ← Tarjeta reutilizable en toda la tienda
│   │   │   ├── ProductDetail.jsx     ← Vista completa del producto
│   │   │   ├── ProductImages.jsx     ← Galería de imágenes
│   │   │   └── WhatsAppButton.jsx    ← "Consultar por WhatsApp"
│   │   │
│   │   ├── cart/
│   │   │   ├── CartDrawer.jsx        ← Carrito lateral (slide-in)
│   │   │   └── CartItem.jsx
│   │   │
│   │   ├── checkout/
│   │   │   ├── CheckoutForm.jsx      ← Datos personales y dirección
│   │   │   ├── PaymentSelector.jsx   ← Wompi / MercadoPago / COD
│   │   │   └── OrderSummary.jsx
│   │   │
│   │   └── common/
│   │       ├── WhatsAppFloat.jsx     ← 💬 Botón flotante en todas las páginas
│   │       ├── LoadingSpinner.jsx
│   │       ├── ErrorMessage.jsx
│   │       └── SEOHead.jsx           ← Meta tags por página
│   │
│   ├── context/
│   │   ├── CartContext.jsx           ← Estado global del carrito
│   │   └── LanguageContext.jsx       ← Idioma activo
│   │
│   ├── hooks/
│   │   ├── useCart.js
│   │   ├── useProducts.js            ← Trae productos por categoría
│   │   └── usePixel.js               ← Dispara eventos de Meta Pixel
│   │
│   ├── services/
│   │   ├── api.js                    ← Cliente Axios configurado al backend
│   │   ├── products.service.js       ← Endpoints de productos
│   │   └── orders.service.js         ← Crear pedido, consultar estado
│   │
│   ├── locales/                      ← Archivos de traducción
│   │   ├── es/translation.json       ← Español (por defecto)
│   │   ├── en/translation.json       ← Inglés
│   │   └── pt/translation.json       ← Portugués
│   │
│   ├── utils/
│   │   ├── formatters.js             ← Formatear precios en COP
│   │   ├── validators.js             ← Validar formularios
│   │   └── pixel.js                  ← Funciones del Meta Pixel
│   │
│   ├── App.jsx                       ← Rutas principales
│   ├── main.jsx                      ← Entry point
│   └── index.css                     ← Estilos globales + Tailwind
│
├── .env                              ← Variables de entorno (NO subir a Git)
├── .env.example                      ← Plantilla de variables
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### 3.3 Backend — estructura detallada
```
backend/
├── src/
│   ├── routes/
│   │   ├── products.routes.js        ← GET /api/products
│   │   ├── orders.routes.js          ← POST /api/orders
│   │   ├── payments.routes.js        ← POST /api/payments/wompi, /mp
│   │   ├── webhooks.routes.js        ← POST /api/webhooks/wompi, /mp, /dropi
│   │   └── tracking.routes.js        ← GET /api/tracking/:orderId
│   │
│   ├── controllers/
│   │   ├── products.controller.js
│   │   ├── orders.controller.js
│   │   ├── payments.controller.js
│   │   └── webhooks.controller.js
│   │
│   ├── services/
│   │   ├── dropi.service.js          ← Toda la lógica con la API de Dropi
│   │   ├── wompi.service.js          ← Lógica de pagos Wompi
│   │   ├── mercadopago.service.js    ← Lógica de pagos MercadoPago
│   │   ├── email.service.js          ← Envío de emails vía Hostinger SMTP
│   │   └── pixel.service.js          ← Meta Conversions API (server-side)
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js        ← Validar API keys internas
│   │   ├── validate.middleware.js    ← Validar body de requests
│   │   └── rateLimit.middleware.js   ← Limitar peticiones
│   │
│   └── utils/
│       ├── logger.js                 ← Logs estructurados
│       └── helpers.js
│
├── .env                              ← Variables de entorno del servidor
├── .env.example
├── index.js                          ← Entry point del servidor
└── package.json
```

---

## 4. FLUJO DE DATOS — COMPRA COMPLETA

```
1. Usuario llega a la tienda (desde Meta Ad)
   └── Frontend carga → Pixel dispara PageView

2. Usuario ve página de producto
   └── Pixel dispara ViewContent

3. Usuario agrega al carrito
   └── CartContext actualiza estado local
   └── Pixel dispara AddToCart

4. Usuario va al checkout
   └── Pixel dispara InitiateCheckout

5. Usuario completa formulario y selecciona pago

   ── Opción A: Wompi / MercadoPago ──
   Frontend → POST /api/payments/wompi (o /mp)
   Backend crea preferencia de pago
   Frontend redirige al checkout de Wompi/MP
   Usuario paga en pasarela externa
   Pasarela llama webhook → POST /api/webhooks/wompi
   Backend verifica firma del webhook
   Backend → POST Dropi API (crear pedido)
   Backend → envía email de confirmación
   Backend responde → Frontend muestra /confirmacion
   Pixel dispara Purchase ✅

   ── Opción B: COD (Contra Entrega) ──
   Frontend → POST /api/orders (con método: COD)
   Backend → POST Dropi API (crear pedido COD)
   Backend → envía email de confirmación
   Frontend muestra /confirmacion
   Pixel dispara Purchase ✅
   Dropi gestiona cobro en la entrega

6. Post-compra
   └── Chatea Pro envía mensaje WhatsApp de bienvenida (si número disponible)
   └── Email de confirmación llega al cliente
```

---

## 5. VARIABLES DE ENTORNO

### 5.1 Frontend (.env)
```bash
# API Backend
VITE_API_URL=https://api-novainvesa.onrender.com

# Meta Pixel
VITE_META_PIXEL_ID=XXXXXXXXXXXXXXXX

# Google Analytics
VITE_GA4_ID=G-XXXXXXXXXX

# WhatsApp
VITE_WHATSAPP_NUMBER=573XXXXXXXXX   # número con código de país, sin +
```

### 5.2 Backend (.env)
```bash
# Servidor
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://www.novainvesa.com

# Dropi
DROPI_API_URL=https://api.dropi.co
DROPI_API_KEY=tu_api_key_de_dropi

# Wompi
WOMPI_PUBLIC_KEY=pub_prod_XXXXXXXX
WOMPI_PRIVATE_KEY=prv_prod_XXXXXXXX
WOMPI_EVENTS_SECRET=tu_secret_de_webhooks

# MercadoPago
MP_ACCESS_TOKEN=APP_USR-XXXXXXXX
MP_WEBHOOK_SECRET=tu_secret_mp

# Email (Hostinger SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=pedidos@novainvesa.com
SMTP_PASS=tu_contraseña_email

# Meta Conversions API
META_PIXEL_ID=XXXXXXXXXXXXXXXX
META_CAPI_TOKEN=tu_token_capi

# Seguridad interna
INTERNAL_API_KEY=clave_aleatoria_larga_y_segura
```

---

## 6. DEPLOY Y CI/CD

### 6.1 Frontend → Hostinger
```
Desarrollador hace push a main (GitHub)
         ↓
GitHub Actions se activa
         ↓
npm run build → genera carpeta /dist
         ↓
FTP Deploy Action sube /dist a Hostinger
         ↓
www.novainvesa.com actualizado ✅
```

**Archivo:** `.github/workflows/deploy-frontend.yml`
```yaml
name: Deploy Frontend
on:
  push:
    branches: [main]
    paths: [frontend/**]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: cd frontend && npm install && npm run build
      - uses: SamKirkland/FTP-Deploy-Action@v4.3.4
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./frontend/dist/
          server-dir: /public_html/
```

### 6.2 Backend → Render.com
```
Desarrollador hace push a main (GitHub)
         ↓
Render detecta cambios en /backend
         ↓
Render hace npm install + npm start
         ↓
api-novainvesa.onrender.com actualizado ✅
```

Render se configura directamente desde su dashboard conectado al repositorio de GitHub. No requiere archivo de workflow.

---

## 7. SEGURIDAD

| Capa | Medida | Herramienta |
|---|---|---|
| HTTPS | SSL en toda la tienda | Hostinger SSL (gratis) |
| CORS | Solo permite requests desde www.novainvesa.com | cors middleware |
| Headers | Headers de seguridad HTTP | helmet |
| Rate Limiting | Máx. 100 req/min por IP | express-rate-limit |
| Variables sensibles | Nunca en el código | dotenv + .gitignore |
| Webhooks | Verificación de firma criptográfica | HMAC SHA-256 |
| API interna | Clave en header para proteger endpoints | INTERNAL_API_KEY |
| Inputs | Sanitización de todos los datos del usuario | express-validator |

---

## 8. ESCALABILIDAD HACIA v2 (App Móvil)

La arquitectura de v1 está diseñada para que la transición a v2 sea mínima:

| Componente v1 | Cambio para v2 | Esfuerzo |
|---|---|---|
| Backend Node.js + Express | Sin cambios — la app consume la misma API REST | ✅ 0% |
| Dropi service | Sin cambios | ✅ 0% |
| Wompi / MP service | Agregar endpoints para SDKs móviles | ⚠️ Bajo |
| Frontend React | Se mantiene para Web | ✅ 0% |
| App React Native | Nuevo repositorio que consume la misma API | 🆕 Nuevo |
| Context API (carrito) | Se reutiliza en React Native | ✅ 0% |
| i18next | Compatible con React Native | ✅ 0% |
| categories.js | Compartido entre web y app | ✅ 0% |

**Conclusión:** El backend no necesita ninguna modificación para soportar la app móvil. Solo se crea el nuevo repositorio de React Native que consume los mismos endpoints.

---

## 9. DIAGRAMA DE COMPONENTES FRONTEND

```
App.jsx (Router)
│
├── Layout
│   ├── Navbar ──────── lee categories.js (genera menú dinámico)
│   ├── LanguageSelector (ES/EN/PT)
│   └── Footer
│
├── WhatsAppFloat ────── visible en TODAS las páginas
│
├── / → Home
│   ├── HeroBanner
│   ├── CategoryGrid ─── lee categories.js
│   └── FeaturedProducts
│
├── /categoria/:slug → CategoryPage
│   ├── CategoryBanner
│   └── ProductGrid
│       └── ProductCard (x N)
│
├── /producto/:id → ProductPage
│   ├── ProductImages
│   ├── ProductDetail
│   └── WhatsAppButton
│
├── /carrito → CartPage
│   └── CartItem (x N)
│
├── /checkout → CheckoutPage
│   ├── CheckoutForm
│   ├── PaymentSelector
│   │   ├── Wompi Widget
│   │   ├── MercadoPago Brick
│   │   └── COD Form
│   └── OrderSummary
│
└── /confirmacion → ConfirmationPage
    └── [dispara Pixel Purchase]
```

---

## 10. CONSIDERACIONES TÉCNICAS IMPORTANTES

### SPA con React Router en Hostinger
Hostinger sirve archivos estáticos. Para que las rutas de React funcionen correctamente (evitar 404 en recarga), se debe crear el archivo `public/.htaccess`:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### Render Free Tier — Cold Start
El backend en Render free tier se "duerme" tras 15 minutos de inactividad. El primer request puede tardar 30-60 segundos. Solución: hacer un ping periódico al backend desde el frontend al cargar la página (warm-up call).

```javascript
// En main.jsx — mantiene el backend despierto
useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/health`)
}, [])
```

### Imágenes
- Todas las imágenes de productos vienen de Dropi (URLs externas)
- Las imágenes propias (banners, logos) se suben a Hostinger
- Usar atributo `loading="lazy"` en todas las imágenes del grid
- Recomendar formato WebP cuando sea posible

---

*Documento vivo — versión 1.0*  
*Documento anterior: PRD (1 de 8) | Próximo: Flujos de Usuario (3 de 8)*
