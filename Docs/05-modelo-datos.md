# Modelo de Datos
## Novainvesa | Tienda de Dropshipping Multi-Categoría
**Versión:** 2.0 — Incluye base de datos MySQL  
**Fecha:** Marzo 2026  
**Estado:** Borrador  
**Documento:** 5 de 8

---

## 1. INTRODUCCIÓN Y DECISIÓN DE BASE DE DATOS

### ¿Por qué MySQL?
Hostinger incluye **MySQL** en todos sus planes de hosting sin costo adicional. Es la opción natural para este proyecto porque:
- Ya tienes el hosting activo — cero costo extra
- Se administra visualmente desde **phpMyAdmin** en el panel de Hostinger
- El backend en Node.js se conecta fácilmente con el paquete `mysql2`
- Es robusto, probado y suficiente para escalar el negocio

### Dónde vive cada tipo de dato

| Fuente | Qué contiene | Dónde vive |
|---|---|---|
| **MySQL (Hostinger)** | Usuarios, pedidos, métricas, wishlist, admin | Base de datos |
| **Dropi API** | Catálogo de productos en tiempo real | API externa |
| **Frontend (localStorage)** | Carrito temporal, idioma | Navegador |
| **Archivos de config** | Categorías, configuración del sitio | Código fuente |

### Cómo se conecta el backend a MySQL

```javascript
// backend/.env — agregar estas variables
DB_HOST=tu_host_mysql_hostinger   // ej: mysql.hostinger.com
DB_PORT=3306
DB_NAME=novainvesa_db
DB_USER=tu_usuario_mysql
DB_PASS=tu_contraseña_mysql

// backend/src/config/database.js
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: '-05:00'  // America/Bogota
})

module.exports = pool
```

---

## 2. DIAGRAMA GENERAL DE TABLAS

```
┌──────────┐       ┌─────────────────┐       ┌──────────────┐
│  users   │──────▶│     orders      │◀──────│ order_items  │
└──────────┘  1:N  └─────────────────┘  1:N  └──────────────┘
     │                     │
     │ 1:N                 │ actualiza
     │                     ▼
┌────────────────┐  ┌─────────────────┐
│ user_addresses │  │  product_stats  │
└────────────────┘  └─────────────────┘
     │
┌──────────────────────┐   ┌──────────────────┐
│user_payment_prefs    │   │ product_searches │
└──────────────────────┘   └──────────────────┘

┌──────────┐    ┌─────────────┐
│ wishlist │    │ admin_users │  ← Solo tú
└──────────┘    └─────────────┘
```

---

## 3. TABLA: `users`

Almacena los usuarios registrados. Los compradores invitados NO se guardan aquí.

```sql
CREATE TABLE users (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  full_name      VARCHAR(150) NOT NULL,
  phone          VARCHAR(20),
  id_number      VARCHAR(20),
  is_active      BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at  DATETIME,
  INDEX idx_email (email)
);
```

### Reglas de negocio
```
email         → Único. Verificado con link al correo (v2)
password_hash → NUNCA la contraseña directa — siempre bcrypt (12 rounds)
is_active     → false = cuenta suspendida
id_number     → Opcional al registrarse, se puede agregar después
```

---

## 4. TABLA: `user_addresses`

Guarda las direcciones de envío de los usuarios registrados.

```sql
CREATE TABLE user_addresses (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  alias        VARCHAR(50) DEFAULT 'Mi casa',
  full_name    VARCHAR(150) NOT NULL,
  phone        VARCHAR(20) NOT NULL,
  country      CHAR(2) DEFAULT 'CO',
  department   VARCHAR(100) NOT NULL,
  city         VARCHAR(100) NOT NULL,
  address      VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(100),
  notes        VARCHAR(200),
  is_default   BOOLEAN DEFAULT FALSE,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);
```

### Reglas de negocio
```
is_default  → Solo UNA dirección default por usuario
Máximo      → 5 direcciones por usuario
alias       → Nombre amigable: "Casa", "Oficina", "Casa de mamá"
```

---

## 5. TABLA: `user_payment_preferences`

Guarda el método de pago preferido. **NUNCA datos de tarjeta.**

```sql
CREATE TABLE user_payment_preferences (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED NOT NULL UNIQUE,
  preferred_method ENUM('WOMPI','MERCADOPAGO','COD') DEFAULT 'WOMPI',
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### ⚠️ Aviso de seguridad
```
NUNCA guardar:
  ✗ Número de tarjeta (ni parcial)
  ✗ CVV / CVC
  ✗ Fecha de vencimiento
  ✗ Tokens de tarjeta

Solo se guarda el NOMBRE del método preferido.
Los datos reales los maneja Wompi o MercadoPago en sus servidores.
```

---

## 6. TABLA: `orders`

Historial de todos los pedidos — usuarios registrados e invitados.

```sql
CREATE TABLE orders (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_code            VARCHAR(30) NOT NULL UNIQUE,
  user_id               INT UNSIGNED,                  -- NULL si es invitado
  dropi_order_id        VARCHAR(100),
  wompi_transaction_id  VARCHAR(100),
  mp_payment_id         VARCHAR(100),

  -- Datos del cliente (copiados al momento de compra)
  customer_name         VARCHAR(150) NOT NULL,
  customer_email        VARCHAR(255) NOT NULL,
  customer_phone        VARCHAR(20) NOT NULL,
  customer_id_number    VARCHAR(20),

  -- Dirección de envío (copiada al momento de compra)
  shipping_country      CHAR(2) NOT NULL DEFAULT 'CO',
  shipping_department   VARCHAR(100) NOT NULL,
  shipping_city         VARCHAR(100) NOT NULL,
  shipping_address      VARCHAR(255) NOT NULL,
  shipping_neighborhood VARCHAR(100),
  shipping_notes        VARCHAR(200),
  tracking_number       VARCHAR(100),
  carrier               VARCHAR(50),

  -- Pago
  payment_method        ENUM('WOMPI','MERCADOPAGO','COD') NOT NULL,
  payment_status        ENUM('PENDING','APPROVED','REJECTED','COD','REFUNDED')
                        NOT NULL DEFAULT 'PENDING',
  subtotal              DECIMAL(12,2) NOT NULL,
  shipping_cost         DECIMAL(12,2) DEFAULT 0.00,
  total                 DECIMAL(12,2) NOT NULL,
  currency              CHAR(3) DEFAULT 'COP',
  paid_at               DATETIME,

  -- Estado del pedido
  status                ENUM(
                          'CREATED','CONFIRMED','PREPARING',
                          'SHIPPED','IN_TRANSIT','DELIVERED',
                          'FAILED','RETURNED','CANCELLED'
                        ) NOT NULL DEFAULT 'CREATED',

  -- Marketing
  utm_source            VARCHAR(100),
  utm_medium            VARCHAR(100),
  utm_campaign          VARCHAR(100),

  -- Canal de venta
  source                ENUM('WEB','WHATSAPP','ADMIN') DEFAULT 'WEB',

  estimated_delivery    DATE,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_order_code (order_code),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_customer_email (customer_email)
);
```

### Reglas de negocio
```
order_code  → Formato: "NOVA-20260329-0001" (fecha + secuencial)
user_id     → NULL para invitados — el pedido igual se guarda completo
Los datos del cliente se COPIAN al crear el pedido
  → Si el usuario cambia su nombre después, el pedido mantiene el original
source      → Distingue si llegó por Web, WhatsApp o fue creado en el panel admin
```

---

## 7. TABLA: `order_items`

Detalle de productos de cada pedido.

```sql
CREATE TABLE order_items (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id         INT UNSIGNED NOT NULL,
  product_id       VARCHAR(100) NOT NULL,
  dropi_product_id VARCHAR(100) NOT NULL,
  product_name     VARCHAR(255) NOT NULL,
  product_image    VARCHAR(500),
  product_category VARCHAR(100),
  quantity         TINYINT UNSIGNED NOT NULL,
  unit_price       DECIMAL(12,2) NOT NULL,
  subtotal         DECIMAL(12,2) NOT NULL,
  currency         CHAR(3) DEFAULT 'COP',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id)
);
```

---

## 8. TABLA: `product_stats`

Métricas de comportamiento por producto. Se actualiza automáticamente.

```sql
CREATE TABLE product_stats (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id     VARCHAR(100) NOT NULL UNIQUE,
  product_name   VARCHAR(255) NOT NULL,
  category_slug  VARCHAR(100),
  view_count     INT UNSIGNED DEFAULT 0,
  search_count   INT UNSIGNED DEFAULT 0,
  cart_add_count INT UNSIGNED DEFAULT 0,
  wishlist_count INT UNSIGNED DEFAULT 0,
  units_sold     INT UNSIGNED DEFAULT 0,
  orders_count   INT UNSIGNED DEFAULT 0,
  total_revenue  DECIMAL(14,2) DEFAULT 0.00,
  first_sale_at  DATETIME,
  last_sale_at   DATETIME,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_id (product_id),
  INDEX idx_units_sold (units_sold DESC),
  INDEX idx_total_revenue (total_revenue DESC)
);
```

### ¿Cuándo se actualiza cada contador?

| Contador | Se incrementa cuando... |
|---|---|
| `view_count` | Usuario carga la página del producto |
| `cart_add_count` | Usuario hace clic en "Agregar al carrito" |
| `wishlist_count` | Usuario agrega a favoritos |
| `units_sold` | Pedido confirmado (pago aprobado o COD creado) |
| `orders_count` | Pedido confirmado |
| `total_revenue` | Pedido confirmado |
| `search_count` | Producto aparece en resultados de búsqueda |

---

## 9. TABLA: `product_searches`

Registra los términos que buscan los clientes.

```sql
CREATE TABLE product_searches (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  search_term   VARCHAR(200) NOT NULL,
  results_count TINYINT UNSIGNED DEFAULT 0,
  user_id       INT UNSIGNED,
  searched_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_search_term (search_term),
  INDEX idx_searched_at (searched_at)
);
```

---

## 10. TABLA: `wishlist`

Lista de favoritos de usuarios registrados.

```sql
CREATE TABLE wishlist (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  product_id    VARCHAR(100) NOT NULL,
  product_name  VARCHAR(255) NOT NULL,
  product_image VARCHAR(500),
  product_price DECIMAL(12,2),
  category_slug VARCHAR(100),
  added_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);
```

### Reglas de negocio
```
Máximo     → 50 productos por usuario
Duplicados → user_id + product_id es único (toggle al re-agregar)
```

---

## 11. TABLA: `admin_users`

Acceso al panel de administración. Solo tú.

```sql
CREATE TABLE admin_users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50) NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('SUPER_ADMIN','ADMIN') DEFAULT 'ADMIN',
  is_active     BOOLEAN DEFAULT TRUE,
  last_login_at DATETIME,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username)
);
```

---

## 12. PANEL DE ADMINISTRACIÓN

### Acceso
```
URL:      https://www.novainvesa.com/admin
Ruta:     Completamente protegida — redirige a login si no hay sesión
Sesión:   JWT con expiración de 8 horas
Visible:  Solo tú (admin_users)
```

### Vistas del panel

**Dashboard** — Resumen del negocio
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Ventas hoy   │ Ventas mes   │ Pedidos hoy  │ Usuarios     │
│  $450.000    │ $3.200.000   │     8        │   127        │
├──────────────┴──────────────┴──────────────┴──────────────┤
│  Gráfico de ventas por día (últimos 30 días)              │
├──────────────────────────┬────────────────────────────────┤
│  Top 5 productos         │  Últimos 5 pedidos             │
└──────────────────────────┴────────────────────────────────┘
```

**Pedidos** — Ver, filtrar, cambiar estado, buscar por cliente  
**Usuarios** — Lista, historial de compras por usuario  
**Productos** — Tabla de métricas ordenable (ventas, vistas, carrito, ingresos)  
**Búsquedas** — Términos populares y búsquedas sin resultados  

---

## 13. CONSULTAS SQL CLAVE PARA EL PANEL

```sql
-- Top 10 productos más vendidos
SELECT product_name, category_slug, units_sold, orders_count,
       FORMAT(total_revenue, 0) AS ingresos_cop
FROM product_stats
ORDER BY units_sold DESC LIMIT 10;

-- Ventas del mes actual por método de pago
SELECT payment_method, COUNT(*) AS pedidos,
       FORMAT(SUM(total), 0) AS ingresos
FROM orders
WHERE MONTH(created_at) = MONTH(CURRENT_DATE)
  AND YEAR(created_at) = YEAR(CURRENT_DATE)
  AND payment_status IN ('APPROVED','COD')
GROUP BY payment_method;

-- Clientes con más compras
SELECT u.full_name, u.email, COUNT(o.id) AS pedidos,
       FORMAT(SUM(o.total), 0) AS total_gastado
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.payment_status IN ('APPROVED','COD')
GROUP BY u.id
ORDER BY SUM(o.total) DESC LIMIT 20;

-- Búsquedas sin resultados (oportunidades de nuevos productos)
SELECT search_term, COUNT(*) AS veces_buscado
FROM product_searches
WHERE results_count = 0
GROUP BY search_term
ORDER BY COUNT(*) DESC LIMIT 20;

-- Ventas por categoría últimos 30 días
SELECT oi.product_category, SUM(oi.quantity) AS unidades,
       FORMAT(SUM(oi.subtotal), 0) AS ingresos
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND o.payment_status IN ('APPROVED','COD')
GROUP BY oi.product_category
ORDER BY SUM(oi.subtotal) DESC;
```

---

## 14. SCRIPT COMPLETO DE CREACIÓN (phpMyAdmin)

Ejecutar este script en phpMyAdmin de Hostinger para crear toda la base de datos de una vez:

```sql
CREATE DATABASE IF NOT EXISTS novainvesa_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE novainvesa_db;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20), id_number VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at DATETIME,
  INDEX idx_email (email)
);

CREATE TABLE user_addresses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  alias VARCHAR(50) DEFAULT 'Mi casa',
  full_name VARCHAR(150) NOT NULL, phone VARCHAR(20) NOT NULL,
  country CHAR(2) DEFAULT 'CO', department VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL, address VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(100), notes VARCHAR(200),
  is_default BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

CREATE TABLE user_payment_preferences (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  preferred_method ENUM('WOMPI','MERCADOPAGO','COD') DEFAULT 'WOMPI',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(30) NOT NULL UNIQUE,
  user_id INT UNSIGNED,
  dropi_order_id VARCHAR(100), wompi_transaction_id VARCHAR(100), mp_payment_id VARCHAR(100),
  customer_name VARCHAR(150) NOT NULL, customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL, customer_id_number VARCHAR(20),
  shipping_country CHAR(2) NOT NULL DEFAULT 'CO',
  shipping_department VARCHAR(100) NOT NULL, shipping_city VARCHAR(100) NOT NULL,
  shipping_address VARCHAR(255) NOT NULL, shipping_neighborhood VARCHAR(100),
  shipping_notes VARCHAR(200), tracking_number VARCHAR(100), carrier VARCHAR(50),
  payment_method ENUM('WOMPI','MERCADOPAGO','COD') NOT NULL,
  payment_status ENUM('PENDING','APPROVED','REJECTED','COD','REFUNDED') NOT NULL DEFAULT 'PENDING',
  subtotal DECIMAL(12,2) NOT NULL, shipping_cost DECIMAL(12,2) DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL, currency CHAR(3) DEFAULT 'COP', paid_at DATETIME,
  status ENUM('CREATED','CONFIRMED','PREPARING','SHIPPED','IN_TRANSIT','DELIVERED','FAILED','RETURNED','CANCELLED') NOT NULL DEFAULT 'CREATED',
  utm_source VARCHAR(100), utm_medium VARCHAR(100), utm_campaign VARCHAR(100),
  source ENUM('WEB','WHATSAPP','ADMIN') DEFAULT 'WEB',
  estimated_delivery DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id), INDEX idx_order_code (order_code),
  INDEX idx_status (status), INDEX idx_created_at (created_at),
  INDEX idx_customer_email (customer_email)
);

CREATE TABLE order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id VARCHAR(100) NOT NULL, dropi_product_id VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL, product_image VARCHAR(500),
  product_category VARCHAR(100), quantity TINYINT UNSIGNED NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL, subtotal DECIMAL(12,2) NOT NULL,
  currency CHAR(3) DEFAULT 'COP',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id), INDEX idx_product_id (product_id)
);

CREATE TABLE product_stats (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(100) NOT NULL UNIQUE,
  product_name VARCHAR(255) NOT NULL, category_slug VARCHAR(100),
  view_count INT UNSIGNED DEFAULT 0, search_count INT UNSIGNED DEFAULT 0,
  cart_add_count INT UNSIGNED DEFAULT 0, wishlist_count INT UNSIGNED DEFAULT 0,
  units_sold INT UNSIGNED DEFAULT 0, orders_count INT UNSIGNED DEFAULT 0,
  total_revenue DECIMAL(14,2) DEFAULT 0.00,
  first_sale_at DATETIME, last_sale_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_id (product_id),
  INDEX idx_units_sold (units_sold DESC),
  INDEX idx_total_revenue (total_revenue DESC)
);

CREATE TABLE product_searches (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  search_term VARCHAR(200) NOT NULL,
  results_count TINYINT UNSIGNED DEFAULT 0,
  user_id INT UNSIGNED,
  searched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_search_term (search_term), INDEX idx_searched_at (searched_at)
);

CREATE TABLE wishlist (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL, product_id VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL, product_image VARCHAR(500),
  product_price DECIMAL(12,2), category_slug VARCHAR(100),
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

CREATE TABLE admin_users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('SUPER_ADMIN','ADMIN') DEFAULT 'ADMIN',
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username)
);
```

---

## 15. PAQUETES A INSTALAR EN EL BACKEND

```bash
npm install mysql2 bcryptjs jsonwebtoken express-validator
```

| Paquete | Uso |
|---|---|
| `mysql2` | Conexión y queries a MySQL |
| `bcryptjs` | Hashear contraseñas |
| `jsonwebtoken` | Sesiones JWT (usuarios y panel admin) |
| `express-validator` | Validar y sanitizar datos antes de guardar |

---

## 16. RESUMEN DE TABLAS

| Tabla | Propósito | Filas estimadas (6 meses) |
|---|---|---|
| `users` | Clientes registrados | ~500 |
| `user_addresses` | Direcciones guardadas | ~800 |
| `user_payment_preferences` | Método preferido | ~500 |
| `orders` | Todos los pedidos | ~1.000 |
| `order_items` | Ítems de cada pedido | ~1.500 |
| `product_stats` | Métricas por producto | ~50 |
| `product_searches` | Log de búsquedas | ~5.000 |
| `wishlist` | Favoritos de usuarios | ~2.000 |
| `admin_users` | Solo tú | 1 |

> El plan de Hostinger soporta cómodamente este volumen. Estás muy lejos del límite de almacenamiento MySQL incluido.

---

*Documento vivo — versión 2.0*  
*Documento anterior: Contrato de API (4 de 8) | Próximo: Design System (6 de 8)*
