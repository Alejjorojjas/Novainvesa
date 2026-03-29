# Design System
## Novainvesa | Tienda de Dropshipping Multi-Categoría
**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Estado:** Borrador  
**Documento:** 6 de 8

---

## 1. INTRODUCCIÓN

Este documento define el sistema de diseño de Novainvesa. Su propósito es garantizar que la tienda tenga una apariencia visual **coherente, profesional y confiable** en todas las páginas y componentes. Cualquier desarrollador o diseñador que trabaje en el proyecto debe seguir estas guías.

### Principios de diseño
| Principio | Descripción |
|---|---|
| **Mobile-first** | Diseñado primero para celular (80%+ del tráfico) |
| **Confianza** | El diseño debe transmitir seguridad para que el usuario compre |
| **Velocidad** | Interfaz ligera, sin animaciones pesadas que frenen la carga |
| **Claridad** | El botón de compra siempre debe ser el elemento más visible |
| **Consistencia** | Los mismos colores, tipografías y espaciados en toda la tienda |

---

## 2. PALETA DE COLORES

### Colores principales

```css
/* tailwind.config.js — colors */
colors: {
  /* Primario — Azul marino profesional */
  primary: {
    50:  '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',   /* ← Color principal de la marca */
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  /* Acento — Naranja energético (CTAs, badges, ofertas) */
  accent: {
    400: '#FB923C',
    500: '#F97316',   /* ← Color de acento principal */
    600: '#EA580C',
  },

  /* Neutros */
  neutral: {
    50:  '#F9FAFB',   /* Fondo de página */
    100: '#F3F4F6',   /* Fondo de cards */
    200: '#E5E7EB',   /* Bordes suaves */
    300: '#D1D5DB',   /* Bordes normales */
    400: '#9CA3AF',   /* Texto placeholder */
    500: '#6B7280',   /* Texto secundario */
    600: '#4B5563',   /* Texto cuerpo */
    700: '#374151',   /* Texto importante */
    800: '#1F2937',   /* Texto principal */
    900: '#111827',   /* Títulos */
  },

  /* Semánticos */
  success: '#10B981',   /* Verde — pedido confirmado, disponible */
  warning: '#F59E0B',   /* Amarillo — advertencias, stock bajo */
  error:   '#EF4444',   /* Rojo — errores, agotado */
  info:    '#3B82F6',   /* Azul — información */
}
```

### Colores por categoría

```css
/* Usados en banners, badges e íconos de cada categoría */
category-mascotas:    '#F59E0B'   /* Ámbar */
category-hogar:       '#10B981'   /* Esmeralda */
category-tecnologia:  '#6366F1'   /* Índigo */
category-belleza:     '#EC4899'   /* Rosa */
category-fitness:     '#EF4444'   /* Rojo */
```

### Uso de colores — reglas

| Elemento | Color |
|---|---|
| Botón primario (CTA) | `primary-600` fondo, texto blanco |
| Botón secundario | Borde `primary-600`, texto `primary-600`, fondo transparente |
| Botón de acción urgente (Comprar ya) | `accent-500` fondo, texto blanco |
| Precio principal | `neutral-900` bold |
| Precio tachado | `neutral-400` con tachado |
| Badge "Oferta" | `accent-500` fondo, texto blanco |
| Badge "Agotado" | `neutral-400` fondo, texto blanco |
| Fondo de página | `neutral-50` |
| Fondo de cards | `white` |
| Texto cuerpo | `neutral-600` |
| Texto títulos | `neutral-900` |
| Links | `primary-600` |
| Errores | `error` (#EF4444) |
| Éxito | `success` (#10B981) |

---

## 3. TIPOGRAFÍA

### Fuentes

```css
/* tailwind.config.js — fontFamily */
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],   /* Cuerpo y UI */
  display: ['Poppins', 'Inter', 'sans-serif'],  /* Títulos y headings */
}

/* index.css — importar desde Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700;800&display=swap');
```

### Escala tipográfica

```
Nombre        Clase Tailwind       Tamaño    Peso      Uso
─────────────────────────────────────────────────────────────────
Display XL    text-5xl / font-bold   48px    800    Hero principal (desktop)
Display L     text-4xl / font-bold   36px    800    Hero principal (mobile)
H1            text-3xl / font-bold   30px    700    Títulos de página
H2            text-2xl / font-semibold 24px  600    Secciones del home
H3            text-xl / font-semibold  20px  600    Nombre de producto (detalle)
H4            text-lg / font-semibold  18px  600    Subtítulos, nombre en card
Body Large    text-base / font-normal  16px  400    Descripciones largas
Body          text-sm / font-normal    14px  400    Texto general, labels
Body Small    text-xs / font-normal    12px  400    Notas, políticas, meta
Price Large   text-2xl / font-bold     24px  700    Precio en página de producto
Price         text-lg / font-semibold  18px  600    Precio en cards
```

### Reglas tipográficas

```
- Máximo 2 pesos de fuente por pantalla (evitar mezclar muchos pesos)
- Línea máxima de texto en cuerpo: 65-70 caracteres (legibilidad)
- Interlineado (line-height): 1.5 para cuerpo, 1.2 para títulos
- Los precios SIEMPRE en bold — es el dato más importante
- Nunca usar texto menor a 12px en mobile
```

---

## 4. ESPACIADO Y GRILLA

### Sistema de espaciado (Tailwind base-4)

```
4px  = 1  (p-1, m-1)   → Separación mínima entre elementos
8px  = 2  (p-2, m-2)   → Padding interno de badges y chips
12px = 3  (p-3, m-3)   → Padding botones pequeños
16px = 4  (p-4, m-4)   → Padding estándar de cards
20px = 5  (p-5, m-5)   → Separación entre secciones pequeñas
24px = 6  (p-6, m-6)   → Padding de secciones
32px = 8  (p-8, m-8)   → Separación entre secciones grandes
48px = 12 (p-12, m-12) → Separación entre bloques mayores
64px = 16 (p-16, m-16) → Padding del hero
```

### Grilla de contenido

```css
/* Contenedor máximo */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;   /* mobile */
}

@media (min-width: 768px) {
  .container { padding: 0 24px; }
}

@media (min-width: 1024px) {
  .container { padding: 0 32px; }
}
```

### Grilla de productos

```
Mobile (< 640px):   2 columnas
Tablet (640-1024px): 3 columnas
Desktop (> 1024px): 4 columnas

/* Tailwind */
grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4
```

---

## 5. COMPONENTES BASE

### 5.1 Botones

```jsx
/* Botón Primario — acción principal */
<button className="
  bg-primary-600 hover:bg-primary-700
  text-white font-semibold
  px-6 py-3 rounded-xl
  transition-colors duration-200
  w-full sm:w-auto
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Agregar al carrito
</button>

/* Botón CTA urgente — "Comprar ahora" */
<button className="
  bg-accent-500 hover:bg-accent-600
  text-white font-bold
  px-8 py-4 rounded-xl text-lg
  shadow-lg shadow-orange-200
  transition-all duration-200
  w-full
">
  Comprar ahora
</button>

/* Botón Secundario — acción alternativa */
<button className="
  border-2 border-primary-600
  text-primary-600 hover:bg-primary-50
  font-semibold
  px-6 py-3 rounded-xl
  transition-colors duration-200
">
  Seguir comprando
</button>

/* Botón Ghost — acción terciaria */
<button className="
  text-neutral-600 hover:text-neutral-900
  font-medium underline
  transition-colors duration-200
">
  Ver más detalles
</button>

/* Botón WhatsApp */
<button className="
  bg-[#25D366] hover:bg-[#22C55E]
  text-white font-semibold
  px-6 py-3 rounded-xl
  flex items-center gap-2
  transition-colors duration-200
  w-full
">
  <WhatsAppIcon /> Consultar por WhatsApp
</button>
```

### 5.2 ProductCard

```jsx
/* Tarjeta de producto — usada en todos los grids */
<div className="
  bg-white rounded-2xl
  shadow-sm hover:shadow-md
  transition-shadow duration-200
  overflow-hidden
  cursor-pointer
  group
">
  {/* Imagen */}
  <div className="relative aspect-square overflow-hidden bg-neutral-100">
    <img
      src={product.images[0]}
      alt={product.name}
      loading="lazy"
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
    {/* Badge oferta */}
    {product.compareAtPrice && (
      <span className="absolute top-2 left-2 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
        OFERTA
      </span>
    )}
    {/* Badge agotado */}
    {!product.inStock && (
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <span className="bg-white text-neutral-700 text-sm font-semibold px-3 py-1 rounded-lg">
          Agotado
        </span>
      </div>
    )}
  </div>

  {/* Info */}
  <div className="p-3 sm:p-4">
    <p className="text-neutral-500 text-xs mb-1">{category.name}</p>
    <h3 className="text-neutral-800 font-semibold text-sm sm:text-base leading-tight line-clamp-2 mb-2">
      {product.name}
    </h3>
    <div className="flex items-center gap-2">
      <span className="text-neutral-900 font-bold text-base sm:text-lg">
        {formatPrice(product.price)}
      </span>
      {product.compareAtPrice && (
        <span className="text-neutral-400 text-sm line-through">
          {formatPrice(product.compareAtPrice)}
        </span>
      )}
    </div>
    <button className="mt-3 w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
      Agregar al carrito
    </button>
  </div>
</div>
```

### 5.3 Navbar

```jsx
/* Estructura del Navbar */
<nav className="
  bg-white
  border-b border-neutral-200
  sticky top-0 z-50
  shadow-sm
">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between h-16">

      {/* Logo */}
      <a href="/" className="font-display font-bold text-xl text-primary-600">
        Novainvesa
      </a>

      {/* Búsqueda — oculta en mobile, visible en tablet+ */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <SearchInput />
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        <LanguageSelector />   {/* ES | EN | PT */}
        <UserButton />         {/* Login / Mi cuenta */}
        <CartButton />         {/* Ícono carrito + contador */}
      </div>
    </div>

    {/* Categorías — barra secundaria (desktop) */}
    <div className="hidden md:flex items-center gap-6 py-2 border-t border-neutral-100">
      {categories.map(cat => (
        <a key={cat.id} href={`/categoria/${cat.slug}`}
           className="text-sm text-neutral-600 hover:text-primary-600 font-medium transition-colors">
          {cat.icon} {cat.name}
        </a>
      ))}
    </div>
  </div>
</nav>
```

### 5.4 Formulario de Checkout

```jsx
/* Estilo base para inputs del checkout */
/* Input normal */
<input className="
  w-full px-4 py-3
  border border-neutral-300
  rounded-xl
  text-neutral-800 text-base
  placeholder-neutral-400
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
  transition-all duration-200
" />

/* Input con error */
<input className="
  w-full px-4 py-3
  border border-error
  rounded-xl
  bg-red-50
  text-neutral-800 text-base
  focus:outline-none focus:ring-2 focus:ring-red-400
" />

/* Mensaje de error */
<p className="text-error text-xs mt-1 flex items-center gap-1">
  <ExclamationIcon className="w-3 h-3" />
  Este campo es obligatorio
</p>

/* Label */
<label className="block text-sm font-medium text-neutral-700 mb-1">
  Nombre completo *
</label>
```

### 5.5 Botón flotante de WhatsApp

```jsx
/* Fijo en esquina inferior derecha — visible en TODAS las páginas */
<a
  href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(siteConfig.contact.whatsappMessage)}`}
  target="_blank"
  rel="noopener noreferrer"
  className="
    fixed bottom-6 right-6
    bg-[#25D366] hover:bg-[#22C55E]
    text-white
    w-14 h-14 rounded-full
    flex items-center justify-center
    shadow-lg hover:shadow-xl
    transition-all duration-200
    z-40
    hover:scale-110
  "
  aria-label="Contactar por WhatsApp"
>
  <WhatsAppIcon className="w-7 h-7" />
</a>
```

### 5.6 Badges y etiquetas

```jsx
/* Badge de categoría */
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${category.color}20`, color: category.color }}>
  {category.icon} {category.name}
</span>

/* Badge de estado de pedido */
const statusStyles = {
  CREATED:    'bg-blue-100 text-blue-700',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  PREPARING:  'bg-yellow-100 text-yellow-700',
  SHIPPED:    'bg-purple-100 text-purple-700',
  IN_TRANSIT: 'bg-purple-100 text-purple-700',
  DELIVERED:  'bg-green-100 text-green-700',
  FAILED:     'bg-red-100 text-red-700',
  CANCELLED:  'bg-neutral-100 text-neutral-600',
}

<span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[order.status]}`}>
  {statusLabel[order.status]}
</span>
```

### 5.7 Selector de idioma

```jsx
/* Botón compacto en el Navbar */
<div className="flex items-center gap-1 border border-neutral-200 rounded-lg p-1">
  {['es', 'en', 'pt'].map(lang => (
    <button
      key={lang}
      onClick={() => changeLanguage(lang)}
      className={`
        px-2 py-1 rounded text-xs font-semibold uppercase transition-colors
        ${currentLang === lang
          ? 'bg-primary-600 text-white'
          : 'text-neutral-500 hover:text-neutral-800'}
      `}
    >
      {lang}
    </button>
  ))}
</div>
```

---

## 6. LAYOUT DE PÁGINAS

### 6.1 Home

```
┌─────────────────────────────────────────────┐
│                   NAVBAR                    │
├─────────────────────────────────────────────┤
│                                             │
│              HERO BANNER                    │
│    Título + subtítulo + CTA principal       │
│    (imagen de fondo o gradiente)            │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│           CATEGORÍAS (grid 2x3 mobile)      │
│    [Mascotas] [Hogar] [Tecnología]          │
│    [Belleza]  [Fitness]                     │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│         PRODUCTOS DESTACADOS                │
│    Título sección + grid de 4-8 productos   │
│                                             │
├─────────────────────────────────────────────┤
│              FOOTER                         │
└─────────────────────────────────────────────┘
│         WhatsApp Float Button               │
```

### 6.2 Página de Categoría

```
┌─────────────────────────────────────────────┐
│                   NAVBAR                    │
├─────────────────────────────────────────────┤
│   BANNER DE CATEGORÍA                       │
│   (imagen + nombre + descripción)           │
├─────────────────────────────────────────────┤
│   Breadcrumb: Inicio > Mascotas             │
├─────────────────────────────────────────────┤
│                                             │
│   GRID DE PRODUCTOS                         │
│   (2 col mobile / 3 col tablet / 4 desktop) │
│                                             │
│   [Paginación o "cargar más"]               │
├─────────────────────────────────────────────┤
│              FOOTER                         │
└─────────────────────────────────────────────┘
```

### 6.3 Página de Producto

```
┌─────────────────────────────────────────────┐
│                   NAVBAR                    │
├─────────────────────────────────────────────┤
│   Breadcrumb: Inicio > Mascotas > Producto  │
├─────────────────────────────────────────────┤
│                                             │
│  [GALERÍA DE      ] [NOMBRE DEL PRODUCTO   ]│
│  [IMÁGENES       ] [Precio: $89.900       ]│
│  [               ] [Precio tachado        ]│
│  [               ] [                      ]│
│  [               ] [Cantidad: [-] 1 [+]   ]│
│  [               ] [                      ]│
│  [               ] [BTN Agregar al carrito]│
│  [               ] [BTN Comprar por WApp  ]│
│                                             │
├─────────────────────────────────────────────┤
│   DESCRIPCIÓN Y BENEFICIOS                  │
├─────────────────────────────────────────────┤
│   PRODUCTOS RELACIONADOS                    │
├─────────────────────────────────────────────┤
│              FOOTER                         │
└─────────────────────────────────────────────┘
```

### 6.4 Checkout

```
┌─────────────────────────────────────────────┐
│               NAVBAR (simplificado)         │
├─────────────────────────────────────────────┤
│   Progreso: Datos → Pago → Confirmación     │
├──────────────────────────┬──────────────────┤
│                          │                  │
│   FORMULARIO             │  RESUMEN         │
│   (datos + dirección +   │  DEL PEDIDO      │
│    método de pago)       │  (sticky)        │
│                          │                  │
│   [BTN Confirmar pedido] │  Total: $89.900  │
│                          │                  │
└──────────────────────────┴──────────────────┘
  (en mobile: resumen arriba, formulario abajo)
```

---

## 7. ICONOGRAFÍA

### Librería: Lucide React

```bash
npm install lucide-react
```

### Íconos estándar por uso

```jsx
import {
  ShoppingCart,       // Carrito
  Heart,              // Wishlist / Favoritos
  Search,             // Búsqueda
  User,               // Mi cuenta
  Menu,               // Menú mobile (hamburguesa)
  X,                  // Cerrar / Eliminar
  ChevronRight,       // Navegación / breadcrumb
  ChevronDown,        // Desplegables
  Plus,               // Aumentar cantidad
  Minus,              // Disminuir cantidad
  Truck,              // Envío
  Shield,             // Garantía / Seguridad
  RotateCcw,          // Devoluciones
  Check,              // Éxito / Confirmación
  AlertCircle,        // Error / Advertencia
  Package,            // Pedido / Paquete
  MapPin,             // Dirección
  Phone,              // Teléfono
  Mail,               // Email
  Globe,              // Idioma / Internacional
  Star,               // Calificación (v2)
  Share2,             // Compartir (v2)
} from 'lucide-react'
```

### Tamaños estándar de íconos

```
16px (w-4 h-4) → Íconos dentro de texto o badges
20px (w-5 h-5) → Íconos de acción secundaria
24px (w-6 h-6) → Íconos de navegación estándar
28px (w-7 h-7) → Botón flotante de WhatsApp
32px (w-8 h-8) → Íconos de características en producto
48px (w-12 h-12)→ Íconos de categoría en el home
```

---

## 8. ANIMACIONES Y TRANSICIONES

### Principio: mínimas y funcionales

```css
/* Estándar para la mayoría de interacciones */
transition-colors duration-200    /* Cambio de color en hover */
transition-shadow duration-200    /* Elevación de cards */
transition-transform duration-300 /* Scale en imágenes */
transition-all duration-200       /* Cambios múltiples */

/* Escala de hover en cards de producto */
group-hover:scale-105

/* Escala de hover en botón flotante WhatsApp */
hover:scale-110

/* Drawer del carrito — deslizamiento lateral */
transform: translateX(100%)  → translateX(0)
transition: transform 300ms ease-in-out
```

### NO usar
```
❌ Animaciones de más de 400ms (percibidas como lentas)
❌ Animaciones en el renderizado inicial (afectan LCP)
❌ Efectos de parallax (rendimiento en mobile)
❌ Animaciones en loop automático
```

---

## 9. FORMATO DE PRECIOS

```javascript
// utils/formatters.js
export const formatPrice = (amount, currency = 'COP') => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Ejemplos:
formatPrice(89900)   → "$89.900"
formatPrice(120000)  → "$120.000"
formatPrice(1250000) → "$1.250.000"
```

---

## 10. RESPONSIVE — BREAKPOINTS

```javascript
// tailwind.config.js
screens: {
  'sm':  '640px',   // Tablet pequeño
  'md':  '768px',   // Tablet
  'lg':  '1024px',  // Desktop
  'xl':  '1280px',  // Desktop grande
}
```

### Comportamiento por breakpoint

| Elemento | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) |
|---|---|---|---|
| Navbar categorías | Menú hamburguesa | Menú hamburguesa | Barra visible |
| Barra de búsqueda | Ícono expandible | Visible | Visible |
| Grid de productos | 2 columnas | 3 columnas | 4 columnas |
| Página de producto | Imagen arriba, info abajo | Imagen arriba, info abajo | Lado a lado |
| Checkout | Resumen arriba, form abajo | Resumen arriba, form abajo | Form izq, resumen der (sticky) |
| Footer | 1 columna | 2 columnas | 4 columnas |
| CartDrawer | Pantalla completa | 400px fijo derecha | 400px fijo derecha |

---

## 11. CONFIGURACIÓN DE TAILWIND

```javascript
// tailwind.config.js — configuración completa
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { /* escala completa del punto 2 */ },
        accent:  { /* escala del punto 2 */ },
        neutral: { /* escala del punto 2 */ },
        success: '#10B981',
        warning: '#F59E0B',
        error:   '#EF4444',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card':    '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
        'button':  '0 4px 12px rgba(37,99,235,0.25)',
      }
    }
  },
  plugins: [
    require('@tailwindcss/line-clamp'), // Para text truncation en cards
  ]
}
```

---

## 12. PÁGINA DE ERROR Y ESTADOS VACÍOS

### Estado: Sin resultados de búsqueda
```jsx
<div className="text-center py-16">
  <Search className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
  <h3 className="text-neutral-700 font-semibold text-xl mb-2">
    No encontramos resultados para "{query}"
  </h3>
  <p className="text-neutral-500 mb-6">
    Intenta con otro término o explora nuestras categorías
  </p>
  <a href="/" className="btn-primary">Ver categorías</a>
</div>
```

### Estado: Carrito vacío
```jsx
<div className="text-center py-12">
  <ShoppingCart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
  <h3 className="text-neutral-700 font-semibold text-lg mb-2">
    Tu carrito está vacío
  </h3>
  <p className="text-neutral-500 mb-6">
    Agrega productos para comenzar tu pedido
  </p>
  <a href="/" className="btn-primary">Ver productos</a>
</div>
```

### Página 404
```jsx
<div className="text-center py-24">
  <p className="text-8xl font-bold text-primary-100 mb-4">404</p>
  <h1 className="text-neutral-800 font-bold text-2xl mb-2">
    Página no encontrada
  </h1>
  <p className="text-neutral-500 mb-8">
    La página que buscas no existe o fue movida
  </p>
  <a href="/" className="btn-primary">Volver al inicio</a>
</div>
```

---

*Documento vivo — versión 1.0*  
*Documento anterior: Modelo de Datos (5 de 8) | Próximo: Reglas de Negocio (7 de 8)*
