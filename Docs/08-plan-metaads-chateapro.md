# Plan Meta Ads + Chatea Pro
## Novainvesa | Tienda de Dropshipping Multi-Categoría
**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Estado:** Borrador  
**Documento:** 8 de 8

---

## 1. INTRODUCCIÓN

Este documento define la estrategia completa de publicidad en Meta (Facebook e Instagram) y la configuración del chatbot de WhatsApp con Chatea Pro. Son los dos motores de adquisición y conversión de clientes de Novainvesa fuera de la tienda web.

```
ECOSISTEMA DE ADQUISICIÓN Y CONVERSIÓN

Meta Ads ──────────────────────────▶ Tienda Web ──────▶ Dropi
(Tráfico pago)                      (Conversión)       (Entrega)
     │                                    │
     │                                    │
     ▼                                    ▼
WhatsApp Bot                       Email Confirmación
(Chatea Pro)                       (Hostinger SMTP)
(Cierre de ventas
 + Atención 24/7)
```

---

## 2. CONFIGURACIÓN DE META BUSINESS SUITE

### 2.1 Activos a crear — paso a paso

#### PASO 1: Crear cuenta en Meta Business Suite
```
1. Ir a business.facebook.com
2. Clic en "Crear cuenta"
3. Nombre del negocio: Novainvesa
4. Email: contacto@novainvesa.com
5. Nombre y apellido del responsable
6. Completar la configuración inicial
```

#### PASO 2: Crear la Página de Facebook
```
1. En Business Suite → Configuración → Páginas → Agregar
2. Crear nueva página:
   Nombre:     Novainvesa
   Categoría:  Tienda de comercio electrónico
   Username:   @novainvesa
3. Completar la página:
   → Foto de perfil: logo de Novainvesa (recomendado 170x170px)
   → Foto de portada: banner de la tienda (820x312px)
   → Descripción: "Tienda online con productos para mascotas, hogar,
     tecnología, belleza y fitness. Envíos a toda Colombia. Pago
     contra entrega disponible."
   → Sitio web: https://www.novainvesa.com
   → WhatsApp: número de negocio
   → Botón de acción: "Comprar ahora" → https://www.novainvesa.com
```

#### PASO 3: Conectar Instagram
```
1. En Business Suite → Configuración → Cuentas de Instagram → Agregar
2. Si ya existe @novainvesa en Instagram: conectar con credenciales
3. Si no existe: crear la cuenta en Instagram primero
   → Username: @novainvesa
   → Foto de perfil: logo (misma que Facebook)
   → Bio: "🛍️ Tienda online | Mascotas 🐾 Hogar 🏠 Tech 📱 Belleza 💄 Fitness 💪
           Envíos a 🇨🇴 | Pago contra entrega
           👇 Compra aquí"
   → Link en bio: https://www.novainvesa.com
```

#### PASO 4: Crear la cuenta publicitaria
```
1. En Business Suite → Configuración → Cuentas publicitarias → Agregar
2. Crear nueva cuenta publicitaria:
   Nombre:   Novainvesa - Publicidad
   Zona horaria: (GMT-5) Bogotá
   Moneda:   USD (dólares — Meta cobra en USD)
3. Agregar método de pago:
   → Tarjeta de crédito/débito internacional
   → O cuenta de PayPal
   → Límite de gasto diario recomendado al inicio: $15 USD
```

#### PASO 5: Verificar el dominio novainvesa.com
```
1. En Business Suite → Configuración → Brand Safety → Dominios
2. Agregar dominio: www.novainvesa.com
3. Elegir método de verificación: "Metatag HTML"
4. Copiar el metatag proporcionado por Meta
5. Pegarlo en el <head> de index.html de la tienda:
   <meta name="facebook-domain-verification" content="XXXXXXXX" />
6. Hacer deploy de la tienda
7. Clic en "Verificar" en Meta → debe decir "Verificado ✅"

IMPORTANTE: Sin el dominio verificado, Meta puede limitar la optimización
de las campañas de conversión.
```

#### PASO 6: Crear y configurar el Meta Pixel
```
1. En Business Suite → Administrador de eventos → Conectar fuentes → Web
2. Crear nuevo Pixel:
   Nombre: Novainvesa Pixel
3. Copiar el Pixel ID (número de 15-16 dígitos)
4. Instalarlo en la tienda (ver sección 3)
5. Verificar que los eventos se disparan correctamente con:
   → Extensión "Meta Pixel Helper" en Chrome
   → O desde Administrador de eventos → Actividad de prueba
```

#### PASO 7: Configurar la Conversions API (CAPI)
```
1. En Administrador de eventos → Pixel → Configuración → Conversions API
2. Generar token de acceso del sistema
3. Guardar el token en: backend/.env como META_CAPI_TOKEN
4. El backend enviará los mismos eventos del Pixel desde el servidor
   (mejora la precisión en ~30% por los bloqueadores de anuncios)
```

---

## 3. INSTALACIÓN DEL META PIXEL EN LA TIENDA

### 3.1 Código base del Pixel

```javascript
// frontend/src/utils/pixel.js

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID

// Inicializar el Pixel (llamar en App.jsx al montar)
export const initPixel = () => {
  if (typeof window === 'undefined') return
  
  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js')
  
  window.fbq('init', PIXEL_ID)
}

// PageView — llamar en cada cambio de ruta
export const trackPageView = () => {
  window.fbq('track', 'PageView')
}

// ViewContent — página de producto
export const trackViewContent = (product) => {
  window.fbq('track', 'ViewContent', {
    content_ids: [product.id],
    content_type: 'product',
    content_name: product.name,
    value: product.price,
    currency: 'COP'
  })
}

// AddToCart — al agregar al carrito
export const trackAddToCart = (product, quantity) => {
  window.fbq('track', 'AddToCart', {
    content_ids: [product.id],
    content_type: 'product',
    content_name: product.name,
    value: product.price * quantity,
    currency: 'COP',
    num_items: quantity
  })
}

// InitiateCheckout — al ir al checkout
export const trackInitiateCheckout = (cartItems, total) => {
  window.fbq('track', 'InitiateCheckout', {
    content_ids: cartItems.map(i => i.productId),
    content_type: 'product',
    num_items: cartItems.reduce((acc, i) => acc + i.quantity, 0),
    value: total,
    currency: 'COP'
  })
}

// Purchase — en página de confirmación
export const trackPurchase = (order) => {
  window.fbq('track', 'Purchase', {
    content_ids: order.items.map(i => i.productId),
    content_type: 'product',
    value: order.total,
    currency: 'COP',
    num_items: order.items.reduce((acc, i) => acc + i.quantity, 0),
    order_id: order.id
  })
}

// Search — en página de búsqueda
export const trackSearch = (searchString) => {
  window.fbq('track', 'Search', { search_string: searchString })
}

// Contact — al hacer clic en WhatsApp
export const trackContact = () => {
  window.fbq('track', 'Contact')
}
```

### 3.2 Hook personalizado usePixel

```javascript
// frontend/src/hooks/usePixel.js
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../utils/pixel'

export const usePixel = () => {
  const location = useLocation()
  
  // Disparar PageView en cada cambio de ruta
  useEffect(() => {
    trackPageView()
  }, [location.pathname])
}

// Usar en App.jsx:
// const App = () => {
//   usePixel()
//   return <Routes>...</Routes>
// }
```

---

## 4. ESTRUCTURA DE CAMPAÑAS META ADS

### 4.1 Fases de publicidad

```
FASE 1 — TESTING (Semanas 1-3 post lanzamiento)
  Objetivo:   Encontrar productos ganadores
  Presupuesto: $5 USD/día por conjunto de anuncios
  Criterio de éxito: ROAS > 2x después de 3 días con datos

FASE 2 — ESCALAR GANADORES (Semana 4 en adelante)
  Objetivo:   Aumentar ventas de los productos que funcionaron
  Presupuesto: +20% cada 3-4 días si ROAS se mantiene > 2x
  Criterio:   No escalar más de 20% a la vez (estabilidad del algoritmo)

FASE 3 — RETARGETING (Cuando haya tráfico suficiente)
  Objetivo:   Recuperar visitantes que no compraron
  Público:    Visitantes últimos 14 días sin evento Purchase
  Presupuesto: $3-5 USD/día
```

### 4.2 Estructura completa de campañas — v1

```
CUENTA PUBLICITARIA: Novainvesa
│
├── CAMPAÑA 1: Mascotas — Conversiones — Colombia
│   Objetivo: Conversiones → Compras
│   Presupuesto: CBO (Presupuesto de campaña) $15 USD/día
│   │
│   ├── Conjunto 1: Intereses — Mascotas amplio
│   │     Público: Colombia | 18-55 años
│   │     Intereses: Mascotas, Perros, Gatos, Accesorios para mascotas
│   │     Placement: Automático
│   │     │
│   │     ├── Anuncio 1A: Video 15s — producto destacado (comedero)
│   │     └── Anuncio 1B: Video 15s — producto alternativo (arnés)
│   │
│   └── Conjunto 2: Intereses — Dueños de mascotas específico
│         Público: Colombia | 25-45 años
│         Intereses: Cuidado de mascotas, Veterinaria, PetSmart
│         │
│         ├── Anuncio 2A: Imagen carrusel (3 productos mascotas)
│         └── Anuncio 2B: Video 30s — beneficios del producto
│
├── CAMPAÑA 2: Hogar — Conversiones — Colombia
│   Objetivo: Conversiones → Compras
│   Presupuesto: CBO $10 USD/día
│   │
│   └── Conjunto 1: Intereses — Hogar y decoración
│         Público: Colombia | 22-50 años
│         Intereses: Decoración del hogar, Organización, IKEA, Easy
│         │
│         ├── Anuncio 1A: Video antes/después del producto
│         └── Anuncio 1B: Video demostrativo del uso del producto
│
├── CAMPAÑA 3: Tecnología — Conversiones — Colombia
│   Objetivo: Conversiones → Compras
│   Presupuesto: CBO $8 USD/día
│   │
│   └── Conjunto 1: Intereses — Tecnología y gadgets
│         Público: Colombia | 18-45 años
│         Intereses: Tecnología, Gadgets, Tiendas tech, Amazon
│         │
│         └── Anuncio 1A: Video unboxing / demostración del gadget
│
└── CAMPAÑA 4: Retargeting General
    Objetivo: Conversiones → Compras
    Presupuesto: $5 USD/día
    │
    └── Conjunto 1: Visitantes sin compra
          Público personalizado: Visitantes web últimos 14 días
                                 EXCLUIR: compradores últimos 30 días
          │
          └── Anuncio 1A: "¿Olvidaste algo? Tu producto te espera 🛒"
```

### 4.3 Distribución del presupuesto inicial ($190 USD)

```
Reserva estratégica:    $40 USD  → Para escalar el primer ganador
Campaña Mascotas:       $60 USD  → 4 días a $15/día
Campaña Hogar:          $40 USD  → 4 días a $10/día
Campaña Tecnología:     $32 USD  → 4 días a $8/día
Retargeting:            $18 USD  → 6 días a $3/día
─────────────────────────────────
TOTAL:                  $190 USD
```

---

## 5. CONFIGURACIÓN DE PÚBLICOS

### 5.1 Públicos principales por categoría

| Categoría | Edad | Intereses principales | Comportamientos |
|---|---|---|---|
| Mascotas | 22-55 | Mascotas, perros, gatos, veterinaria | Compradores online frecuentes |
| Hogar | 25-50 | Decoración, organización, hogar, IKEA | Propietarios de vivienda |
| Tecnología | 18-45 | Gadgets, tech, electrónica, Amazon | Early adopters |
| Belleza | 18-45 | Belleza, skincare, maquillaje, K-beauty | Compras en línea de belleza |
| Fitness | 20-45 | Gym, fitness, nutrición, deporte en casa | Usuarios de apps de salud |

### 5.2 Públicos personalizados (crear desde el inicio)

```
1. Visitantes del sitio web (todos) — últimos 30 días
   → Base para retargeting

2. Visitantes de página de producto — últimos 14 días
   → Retargeting de alta intención

3. AddToCart sin Purchase — últimos 7 días
   → Recuperación de carrito abandonado (el más valioso)

4. Compradores — últimos 180 días
   → Excluir de campañas de prospección
   → Base para crear Lookalike

5. Lookalike 1% de compradores — Colombia
   → Crear cuando haya 50+ compradores (necesario para estadística)
```

### 5.3 Configuración de públicos geográficos

```
Fase 1 (lanzamiento):   Colombia — todas las ciudades
Fase 2 (mes 2-3):       Colombia + México + Perú
Fase 3 (mes 4+):        Expandir a Chile, Ecuador, Venezuela

Para Colombia — ciudades con más potencial de e-commerce:
  Bogotá, Medellín, Cali, Barranquilla, Bucaramanga,
  Cartagena, Pereira, Manizales, Santa Marta, Cúcuta
```

---

## 6. CREATIVOS — GUÍA DE PRODUCCIÓN

### 6.1 Formatos requeridos por placement

| Placement | Formato | Dimensiones | Duración |
|---|---|---|---|
| Reels / Stories | Video vertical | 1080 × 1920 px (9:16) | 7-15 seg |
| Feed Facebook | Video cuadrado | 1080 × 1080 px (1:1) | 15-30 seg |
| Feed Instagram | Video cuadrado | 1080 × 1080 px (1:1) | 15-30 seg |
| Feed Facebook | Imagen estática | 1080 × 1080 px | — |
| Carrusel | Imágenes múltiples | 1080 × 1080 px | 3-5 tarjetas |

### 6.2 Estructura de un video ganador (15-30 seg)

```
0-3 seg:   GANCHO visual — algo que detenga el scroll
            Ejemplos: El problema que resuelve, reacción de sorpresa,
            antes/después, texto llamativo en pantalla

3-10 seg:  DEMOSTRACIÓN — mostrar el producto en uso
            Cómo funciona, qué problema resuelve, beneficio principal

10-20 seg: PRUEBA SOCIAL o BENEFICIOS adicionales
            "Más de 500 vendidos", "Llega en 3-7 días", "Pago contra entrega"

20-30 seg: CALL TO ACTION claro
            "Compra ahora en novainvesa.com"
            "Envío a toda Colombia 🇨🇴"
```

### 6.3 Copy de los anuncios

#### Estructura del texto principal
```
Línea 1 (gancho):  Pregunta o afirmación que impacte
                   Ej: "¿Tu mascota come a sus horas aunque no estés en casa? 🐾"

Línea 2 (beneficio): El producto resuelve el problema
                   Ej: "Con el comedero automático Novainvesa puedes programar
                   hasta 4 comidas al día desde tu celular 📱"

Línea 3 (prueba):  Razón para confiar
                   Ej: "✅ +500 unidades vendidas
                        📦 Envío a toda Colombia
                        💰 Pago contra entrega disponible"

Línea 4 (urgencia/CTA): Llamada a la acción
                   Ej: "👆 Haz clic y llévalo hoy"
```

#### Títulos de anuncios (máx 40 caracteres)
```
Mascotas:    "Comedero automático para tu mascota"
Hogar:       "Organiza tu hogar en minutos ✨"
Tecnología:  "El gadget que necesitas ver 📱"
Belleza:     "Skincare que realmente funciona 💄"
Fitness:     "Tu gym en casa por menos 💪"
```

### 6.4 Herramientas para crear creativos

| Herramienta | Uso | Costo |
|---|---|---|
| CapCut | Edición de videos para Reels/Stories | Gratis |
| Canva | Imágenes estáticas y carruseles | Gratis (plan básico) |
| Videos de Dropi | Los proveedores en Dropi suelen tener videos del producto | Gratis |
| iPhone/Android | Grabar video del producto en mano | Gratis |

---

## 7. MÉTRICAS Y KPIs DE META ADS

### 7.1 KPIs principales

| Métrica | Qué mide | Objetivo mínimo | Acción si no se cumple |
|---|---|---|---|
| **ROAS** | Retorno sobre inversión en ads | ≥ 2x | Pausar y cambiar creativo |
| **CTR** | % de personas que hacen clic | ≥ 1.5% | Cambiar imagen/video |
| **CPM** | Costo por 1.000 impresiones | < $8 USD | Revisar audiencia |
| **CPC** | Costo por clic | < $0.50 USD | Revisar copy + creativo |
| **Costo por compra** | Costo de adquirir un cliente | < 40% del precio de venta | Optimizar o pausar |
| **Frecuencia** | Veces que ve el anuncio el mismo usuario | < 3 en 7 días | Rotar creativos |

### 7.2 Cómo leer los resultados en el Administrador

```
Columnas recomendadas a configurar en Meta Ads Manager:

ENTREGA:
  √ Resultados (compras)
  √ Alcance
  √ Impresiones
  √ Frecuencia

RENDIMIENTO:
  √ Costo por resultado (costo por compra)
  √ ROAS de compras (retorno total)
  √ Importe gastado
  √ Valor de conversión de compras

PARTICIPACIÓN:
  √ CTR (tasa de clic en enlace)
  √ CPC (costo por clic en enlace)
  √ CPM (costo por 1.000 impresiones)
```

### 7.3 Reglas de optimización

```
Regla 1 — Pausar anuncio con bajo rendimiento:
  SI después de 3 días:
    gasto > $15 USD Y compras = 0
  ENTONCES pausar el anuncio y probar nuevo creativo

Regla 2 — Escalar ganador:
  SI ROAS > 3x durante 3 días consecutivos
  ENTONCES aumentar presupuesto 20% (nunca más del 20% a la vez)

Regla 3 — Rotar creativos:
  SI frecuencia > 3 en 7 días
  ENTONCES agregar nuevo creativo al conjunto de anuncios

Regla 4 — Retargeting activo:
  SI visitantes web del último mes > 500
  ENTONCES activar campaña de retargeting con carrito abandonado
```

---

## 8. CONFIGURACIÓN DE CHATEA PRO

### 8.1 Setup inicial

```
PASO 1: Crear cuenta en Chatea Pro
  → Ir a chateapro.com
  → Crear cuenta con email: contacto@novainvesa.com
  → Seleccionar plan (verificar el que incluye WhatsApp Business API)

PASO 2: Conectar número de WhatsApp Business
  → Tener un número de teléfono colombiano dedicado para el negocio
  → En Chatea Pro → Canales → WhatsApp → Conectar
  → Seguir el proceso de verificación del número con Meta
  → El número quedará vinculado a WhatsApp Business API oficial

PASO 3: Configurar perfil de WhatsApp Business
  Nombre del negocio:  Novainvesa
  Descripción:         "Tienda online | Mascotas, Hogar, Tech, Belleza, Fitness
                        Envíos a Colombia 🇨🇴 | Pago contra entrega"
  Foto de perfil:      Logo de Novainvesa
  Email:               contacto@novainvesa.com
  Sitio web:           https://www.novainvesa.com
  Dirección:           Bogotá, Colombia
  Horario:             Lunes a Sábado, 8:00am - 8:00pm

PASO 4: Configurar mensaje de ausencia (fuera de horario)
  "¡Hola! 👋 Gracias por contactar a Novainvesa.
  Estamos fuera de nuestro horario de atención (Lun-Sab 8am-8pm).
  Te responderemos en cuanto abramos.
  Mientras tanto, puedes ver todos nuestros productos en:
  👉 https://www.novainvesa.com"
```

### 8.2 Construcción de flujos en Chatea Pro

#### FLUJO 1 — Bienvenida (disparador: cualquier mensaje nuevo)

```
[ENTRADA] Cualquier mensaje del usuario

[BOT] "¡Hola, {nombre}! 👋 Bienvenido a *Novainvesa* 🛍️
Tu tienda de confianza en Colombia.

¿En qué te podemos ayudar hoy?"

[BOTONES DE RESPUESTA RÁPIDA]
  → 🛍️ Ver productos / Catálogo
  → 📦 Hacer un pedido
  → 🔍 Estado de mi pedido
  → ❓ Preguntas frecuentes
  → 👤 Hablar con un asesor

[TIEMPO DE ESPERA] Si no responde en 5 minutos → reenviar menú principal
```

#### FLUJO 2 — Ver catálogo y hacer pedido

```
[ENTRADA] Usuario selecciona "Ver productos" o "Hacer un pedido"

[BOT] "¡Perfecto! ¿Qué categoría te interesa? 👇"

[BOTONES]
  → 🐾 Mascotas
  → 🏠 Hogar
  → 📱 Tecnología
  → 💄 Belleza
  → 💪 Fitness

[SI selecciona categoría]
[BOT] Envía imagen del producto destacado + precio
"*{nombre del producto}*
💰 Precio: ${precio}
📦 Envío a toda Colombia
✅ Pago contra entrega disponible

¿Te interesa este producto?"

[BOTONES]
  → ✅ Sí, quiero comprarlo
  → 👀 Ver otro producto
  → 🏠 Ver otras categorías

[SI selecciona "Sí, quiero comprarlo"]
[BOT] "¡Excelente elección! 🎉 Para procesar tu pedido necesito
algunos datos. ¿Me puedes dar tu *nombre completo*?"

[RECOPILAR DATOS — uno por mensaje]
  1. Nombre completo
  2. Número de cédula
  3. Ciudad
  4. Dirección completa
  5. Teléfono de contacto
  6. Cantidad

[BOT CONFIRMA] "Perfecto, estos son los datos de tu pedido:

📦 *Producto:* {producto}
💰 *Total:* ${precio × cantidad}
👤 *Nombre:* {nombre}
📍 *Ciudad:* {ciudad}
🏠 *Dirección:* {dirección}
📞 *Teléfono:* {teléfono}

¿Confirmas tu pedido?"

[BOTONES]
  → ✅ Confirmar pedido
  → ✏️ Corregir datos

[SI confirma]
[BOT] "¡Pedido registrado exitosamente! 🎉

Tu número de pedido es: *#WA-{fecha}-{número}*

📱 Te contactaremos en las próximas *2 horas* para confirmar
la disponibilidad y fecha de entrega.

¡Gracias por comprar en Novainvesa! 🙌"

[NOTIFICACIÓN AL OPERADOR] → Dashboard de Chatea Pro muestra el pedido
```

#### FLUJO 3 — Estado del pedido

```
[ENTRADA] Usuario selecciona "Estado de mi pedido"

[BOT] "Para consultar tu pedido, necesito uno de estos datos:
  → Tu *número de pedido* (ej: NOVA-20260329-0001)
  → O tu *número de cédula*

¿Cuál tienes a la mano?"

[USUARIO responde]

[BOT] "Dame un momento, voy a consultar tu pedido... 🔍"

[NOTIFICACIÓN AL OPERADOR para respuesta manual]

[OPERADOR responde desde el dashboard de Chatea Pro]
```

#### FLUJO 4 — Preguntas frecuentes

```
[ENTRADA] Usuario selecciona "Preguntas frecuentes"

[BOT] "Aquí están las preguntas más comunes 👇
¿Sobre qué tema tienes dudas?"

[BOTONES]
  → 🚚 Envíos y tiempos de entrega
  → 💰 Formas de pago
  → 🔄 Devoluciones y garantías
  → 🛒 ¿Cómo comprar?
  → ❓ Otra pregunta

[RESPUESTAS AUTOMÁTICAS]

"🚚 *Envíos y tiempos de entrega:*
Hacemos envíos a toda Colombia 🇨🇴
Tiempo estimado: *3-7 días hábiles* según tu ciudad.
Ciudades principales (Bogotá, Medellín, Cali): 2-4 días."

"💰 *Formas de pago:*
Aceptamos:
✅ Pago contra entrega (efectivo al recibir)
✅ PSE y Nequi (Wompi)
✅ Bancolombia
✅ Daviplata
✅ Tarjeta crédito/débito
✅ MercadoPago"

"🔄 *Devoluciones:*
Tienes *5 días hábiles* desde que recibes el producto para
solicitar una devolución por defecto de fábrica.
Escríbenos aquí mismo y lo gestionamos."

"🛒 *¿Cómo comprar?*
Opción 1: 👉 https://www.novainvesa.com
Opción 2: Dinos qué producto te interesa
y te ayudamos aquí mismo."
```

#### FLUJO 5 — Recuperación de carrito abandonado (v2)

```
[DISPARADOR] Webhook del frontend detecta InitiateCheckout sin Purchase
             después de 60 minutos

[BOT — mensaje automático]
"¡Hola {nombre}! 👋

Notamos que dejaste productos en tu carrito en Novainvesa 🛒

¿Te podemos ayudar a completar tu pedido?"

[BOTONES]
  → ✅ Sí, completar mi compra
  → ❌ No, gracias

[SI quiere completar]
[BOT] "¡Perfecto! Puedes continuar aquí:
👉 https://www.novainvesa.com/carrito

O si prefieres, te tomamos el pedido directamente aquí por WhatsApp 😊"

[SI no quiere]
[BOT] "¡Entendido! Cuando quieras nos encuentras en
👉 https://www.novainvesa.com
o escríbenos aquí. ¡Hasta pronto! 👋"
[No volver a escribir por 72 horas]
```

### 8.3 Configuración de horario y escalada a humano

```
HORARIO DE ATENCIÓN:
  Lunes a Sábado: 8:00am - 8:00pm (hora Colombia)
  Domingo:        Cerrado (mensaje automático)

ESCALADA A HUMANO:
  Cuando el bot no entiende 2 respuestas seguidas → transferir a operador
  Cuando el usuario selecciona "Hablar con un asesor" → transferir
  Cuando hay un reclamo o devolución → transferir siempre

MODO MANUAL:
  El operador puede tomar control en cualquier momento
  Al terminar la atención manual → devolver al bot o cerrar conversación

ETIQUETAS DE CONVERSACIÓN (para organizar):
  🟢 NUEVO LEAD       → Primera vez que escribe
  🟡 EN PROCESO       → Pedido en curso
  🔵 PEDIDO REALIZADO → Compra confirmada
  🔴 RECLAMO          → Problema con pedido
  ⚫ CERRADO          → Resuelto
```

### 8.4 Integración del botón WhatsApp en la tienda

```jsx
// En siteConfig — número de WhatsApp
whatsapp: "573001234567"  // Sin + ni espacios

// Botón flotante (todas las páginas)
href="https://wa.me/573001234567?text=Hola%20Novainvesa%2C%20necesito%20ayuda%20%F0%9F%91%8B"

// Botón en página de producto (con contexto)
const whatsappUrl = `https://wa.me/573001234567?text=${encodeURIComponent(
  `Hola! Me interesa el producto: ${product.name} - $${formatPrice(product.price)} - ${window.location.href}`
)}`
```

---

## 9. KPIs DE CHATEA PRO

| Métrica | Fórmula | Objetivo |
|---|---|---|
| Tasa de respuesta automática | Mensajes respondidos por bot / Total mensajes | > 75% |
| Tasa de conversión WhatsApp | Pedidos por WhatsApp / Total chats iniciados | > 5% |
| Tiempo de primera respuesta | Tiempo hasta la primera respuesta del bot | < 5 seg |
| Chats escalados a humano | Chats transferidos / Total chats | < 25% |
| Tasa de recuperación carrito | Carritos recuperados / Mensajes enviados | > 10% |
| Satisfacción (v2) | Calificación post-atención | > 4/5 |

---

## 10. CALENDARIO DE PUBLICACIONES ORGÁNICAS

Las publicaciones orgánicas en Facebook e Instagram complementan los anuncios y generan confianza de marca.

### Frecuencia recomendada
```
Instagram: 4-5 veces por semana
Facebook:  3-4 veces por semana
Stories:   Diariamente (detrás de cámaras, productos, testimonios)
Reels:     2-3 veces por semana (mayor alcance orgánico)
```

### Tipos de contenido
| Tipo | Frecuencia | Ejemplos |
|---|---|---|
| Producto en uso | 40% | Video demostrativo, foto lifestyle |
| Educativo | 20% | Tips relacionados con el nicho |
| Prueba social | 20% | Fotos de clientes, reseñas |
| Promocional | 15% | Ofertas, lanzamientos de productos |
| Behind the scenes | 5% | Empaque de pedidos, novedades |

---

## 11. CHECKLIST DE LANZAMIENTO

### Meta Ads
- [ ] Cuenta de Meta Business Suite creada
- [ ] Página de Facebook creada y completa
- [ ] Instagram @novainvesa creado y vinculado
- [ ] Cuenta publicitaria creada con método de pago
- [ ] Dominio www.novainvesa.com verificado
- [ ] Meta Pixel instalado y disparando los 5 eventos
- [ ] Conversions API configurada en el backend
- [ ] Públicos personalizados creados (visitantes, AddToCart)
- [ ] Primera campaña de testing creada (Mascotas)
- [ ] Creativos subidos (mínimo 2 videos por campaña)
- [ ] Extensión Meta Pixel Helper verificando eventos correctamente

### Chatea Pro
- [ ] Cuenta en Chatea Pro creada
- [ ] Número de WhatsApp Business conectado a Chatea Pro
- [ ] Perfil de WhatsApp Business completo
- [ ] Flujo 1 (Bienvenida) configurado y probado
- [ ] Flujo 2 (Catálogo / Pedido) configurado y probado
- [ ] Flujo 3 (Estado de pedido) configurado y probado
- [ ] Flujo 4 (FAQ) configurado con todas las respuestas
- [ ] Horario de atención configurado
- [ ] Mensaje de fuera de horario configurado
- [ ] Escalada a humano configurada
- [ ] Botón flotante de WhatsApp activo en la tienda
- [ ] Botón "Consultar por WhatsApp" en páginas de producto
- [ ] Prueba completa del flujo de compra por WhatsApp

---

## 12. RESUMEN EJECUTIVO — ECOSISTEMA DIGITAL COMPLETO

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOVAINVESA — ECOSISTEMA DIGITAL               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ADQUISICIÓN          CONVERSIÓN           RETENCIÓN           │
│                                                                 │
│  Meta Ads         →   Tienda Web       →   Email automático    │
│  (Facebook + IG)      www.novainvesa.com   (Hostinger SMTP)    │
│                        ↓                                       │
│  Orgánico         →   Dropi API        →   WhatsApp Bot        │
│  (Reels, posts)       (Pedidos)            (Chatea Pro)        │
│                        ↓                                       │
│                       MySQL            →   Panel Admin         │
│                       (Métricas)           /admin              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  PRESUPUESTO INICIAL: $190 USD en Meta Ads                      │
│  META ROAS:           ≥ 2x                                      │
│  META VENTAS MES 1:   10+ pedidos                               │
│  RESPUESTA BOT:       < 5 segundos, 24/7                        │
└─────────────────────────────────────────────────────────────────┘
```

---

*Documento vivo — versión 1.0*  
*Documento anterior: Reglas de Negocio (7 de 8)*  
*Este es el último documento de la fase de planificación.*  
*Siguiente fase: DESARROLLO — construir la tienda.*
