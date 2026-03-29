# Flujos de Usuario
## Novainvesa | Tienda de Dropshipping Multi-Categoría
**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Estado:** Borrador  
**Documento:** 3 de 8

---

## 1. INTRODUCCIÓN

Este documento describe todos los flujos que un usuario puede seguir dentro de Novainvesa, desde que ve un anuncio hasta que recibe su pedido. Cada flujo incluye los pasos, las decisiones del usuario, los estados del sistema y los eventos que se disparan (Pixel, emails, WhatsApp).

### Tipos de usuario
| Tipo | Descripción |
|---|---|
| **Visitante** | Llega por primera vez, no ha comprado |
| **Comprador** | Ha completado al menos una compra |
| **Abandonador** | Inició el proceso de compra pero no terminó |

---

## 2. MAPA GENERAL DE FLUJOS

```
                    ┌─────────────────┐
                    │   META ADS      │
                    │ (Facebook / IG) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     HOME        │
                    │  www.novainvesa.com │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐  ┌───────▼──────┐  ┌──────▼──────┐
    │  CATEGORÍA  │  │   BÚSQUEDA   │  │  PRODUCTO   │
    │  (listado)  │  │   /buscar    │  │  (directo)  │
    └──────┬──────┘  └───────┬──────┘  └──────┬──────┘
           │                 │                 │
           └─────────────────▼─────────────────┘
                             │
                    ┌────────▼────────┐
                    │    PRODUCTO     │
                    │   (detalle)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐  ┌────▼────┐  ┌─────▼──────┐
       │  AGREGAR AL │  │WHATSAPP │  │  SEGUIR    │
       │   CARRITO   │  │  BOT    │  │ COMPRANDO  │
       └──────┬──────┘  └────┬────┘  └─────┬──────┘
              │              │             │
              │         ┌────▼──────┐      │
              │         │  CHATEA   │      │
              │         │   PRO     │      │
              │         └───────────┘      │
              │                            │
              └─────────────┬──────────────┘
                            │
                   ┌────────▼────────┐
                   │    CARRITO      │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │   CHECKOUT      │
                   └────────┬────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
    ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │    WOMPI    │  │ MERCADOPAGO │  │     COD     │
    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
           │                │                │
           └────────────────▼────────────────┘
                            │
                   ┌────────▼────────┐
                   │  CONFIRMACIÓN   │
                   │  (Pixel ✅)     │
                   └─────────────────┘
```

---

## 3. FLUJO 1 — DESCUBRIMIENTO Y NAVEGACIÓN

### 3.1 Entrada por Meta Ads → Página de producto
```
PASO 1: Usuario ve anuncio en Facebook o Instagram
  └── Anuncio muestra producto específico (ej: comedero automático para mascotas)

PASO 2: Usuario hace clic en el anuncio
  └── Pixel: PageView
  └── Pixel: ViewContent (con product_id, value, currency)

PASO 3: Aterriza en /producto/:id
  └── Ve: imágenes, nombre, precio en COP, descripción, beneficios
  └── Ve: botón "Agregar al carrito"
  └── Ve: botón "Consultar por WhatsApp"
  └── Ve: botón flotante de WhatsApp (esquina inferior derecha)

DECISIÓN del usuario:
  ├── Agrega al carrito → Flujo 4 (Carrito)
  ├── Escribe por WhatsApp → Flujo 7 (Bot WhatsApp)
  ├── Navega a otra categoría → Flujo 3.2
  └── Sale del sitio → Flujo 8 (Recuperación)
```

### 3.2 Entrada por Home → Exploración
```
PASO 1: Usuario llega al Home (/)
  └── Pixel: PageView
  └── Ve: banner principal, sección de categorías, productos destacados

PASO 2: Usuario hace clic en una categoría
  └── Navega a /categoria/:slug (ej: /categoria/mascotas)
  └── Pixel: PageView

PASO 3: Usuario ve el grid de productos
  └── Puede filtrar (en v2) o scrollear el listado

PASO 4: Usuario hace clic en un producto
  └── Navega a /producto/:id
  └── Pixel: ViewContent

DECISIÓN del usuario:
  ├── Agrega al carrito → Flujo 4
  ├── Vuelve al listado → repite PASO 3
  └── Va a otra categoría → repite PASO 2
```

### 3.3 Búsqueda de productos
```
PASO 1: Usuario escribe en la barra de búsqueda
  └── Pixel: Search (con search_string)

PASO 2: Sistema muestra /buscar?q=termino
  └── Resultados de productos que coinciden con el término

PASO 3: Usuario hace clic en un resultado
  └── Navega a /producto/:id
  └── Pixel: ViewContent

ESTADO: Sin resultados
  └── Sistema muestra mensaje: "No encontramos productos para [término]"
  └── Muestra sugerencias de categorías populares
```

---

## 4. FLUJO 2 — CAMBIO DE IDIOMA

```
PASO 1: Usuario ve el selector de idioma en el Navbar
  └── Botón visible: ES | EN | PT

PASO 2: Usuario hace clic en un idioma
  └── Sistema carga el archivo de traducción correspondiente
  └── Toda la interfaz cambia de idioma instantáneamente (sin recargar)
  └── Idioma se guarda en localStorage

PASO 3: En próximas visitas
  └── Sistema lee localStorage y aplica el idioma guardado automáticamente

NOTA: Los precios SIEMPRE se muestran en COP independiente del idioma.
```

---

## 5. FLUJO 3 — PÁGINA DE PRODUCTO (detalle)

```
ENTRADA: Usuario llega a /producto/:id

SISTEMA carga:
  ├── Imágenes del producto (galería)
  ├── Nombre del producto
  ├── Precio en COP (formateado: $49.900)
  ├── Descripción corta y larga
  ├── Beneficios / características
  └── Disponibilidad (en stock / agotado)

ESTADO: Producto disponible
  ├── Botón "Agregar al carrito" → activo
  └── Botón "Consultar por WhatsApp" → activo

ESTADO: Producto agotado
  ├── Botón "Agregar al carrito" → deshabilitado
  └── Mensaje: "Producto temporalmente agotado"
  └── Botón "Avisarme cuando esté disponible" → abre WhatsApp Bot

ACCIONES del usuario:
  ├── Cambiar cantidad (selector +/-)
  ├── Ver imagen en grande (lightbox)
  ├── Agregar al carrito
  │     └── CartDrawer se abre desde la derecha
  │     └── Pixel: AddToCart
  └── Consultar por WhatsApp
        └── Abre WhatsApp con mensaje predefinido:
            "Hola! Me interesa el producto: [nombre] - [URL]"
```

---

## 6. FLUJO 4 — CARRITO

```
ENTRADA: Usuario agrega producto → CartDrawer se abre

VISTA DEL CARRITO:
  ├── Lista de productos agregados
  │     ├── Imagen, nombre, precio unitario
  │     ├── Selector de cantidad (+/-)
  │     └── Botón eliminar (X)
  ├── Subtotal
  └── Botón "Ir al Checkout" (CTA principal)

ACCIONES del usuario:
  ├── Cambiar cantidad
  │     └── Sistema recalcula subtotal en tiempo real
  ├── Eliminar producto
  │     └── Sistema actualiza carrito
  │     └── Si carrito queda vacío → muestra mensaje + botón "Ver productos"
  ├── Cerrar el drawer (seguir comprando)
  │     └── Vuelve a la página anterior con carrito guardado
  └── Ir al Checkout
        └── Pixel: InitiateCheckout
        └── Navega a /checkout

ESTADO: Carrito vacío
  └── Mensaje: "Tu carrito está vacío"
  └── Botón "Ver productos" → navega al Home

PERSISTENCIA:
  └── El carrito se guarda en localStorage
  └── Si el usuario cierra el navegador y vuelve, el carrito persiste
```

---

## 7. FLUJO 5 — CHECKOUT (el más importante)

### 7.1 Formulario de datos
```
ENTRADA: Usuario llega a /checkout
  └── Pixel: InitiateCheckout

SECCIÓN 1 — Datos personales:
  ├── Nombre completo *
  ├── Número de cédula *
  ├── Correo electrónico *
  └── Teléfono / WhatsApp *

SECCIÓN 2 — Dirección de envío:
  ├── País (Colombia por defecto, selector para LATAM)
  ├── Departamento / Estado *
  ├── Ciudad *
  ├── Dirección completa *
  ├── Barrio / Colonia
  └── Instrucciones adicionales (opcional)

SECCIÓN 3 — Resumen del pedido:
  ├── Lista de productos con imágenes y precios
  ├── Subtotal
  ├── Costo de envío (calculado al ingresar ciudad)
  └── Total a pagar

VALIDACIONES en tiempo real:
  ├── Email: formato válido
  ├── Teléfono: mínimo 10 dígitos
  ├── Todos los campos obligatorios (*) deben estar llenos
  └── Ciudad: verificar cobertura de Dropi para habilitar COD
```

### 7.2 Selección de método de pago
```
SECCIÓN 4 — Método de pago:

┌─────────────────────────────────────────────────────┐
│  ○  Pago online — Wompi                             │
│     PSE | Nequi | Bancolombia | Tarjeta crédito/déb │
├─────────────────────────────────────────────────────┤
│  ○  Pago online — MercadoPago                       │
│     Daviplata | Tarjeta | Cuenta MercadoPago        │
├─────────────────────────────────────────────────────┤
│  ○  Pago contra entrega (solo ciudades con cobertura│
│     Dropi)                                          │
│     ⚠️ [DESHABILITADO si ciudad sin cobertura]      │
└─────────────────────────────────────────────────────┘

BOTÓN: "Confirmar pedido" (CTA final)
  └── Solo activo si todos los campos están completos
```

### 7.3 Procesamiento del pago
```
── Ruta A: WOMPI ──

Usuario hace clic "Confirmar pedido"
  └── Frontend llama: POST /api/payments/wompi
  └── Backend crea transacción en Wompi API
  └── Backend retorna URL del checkout de Wompi
  └── Frontend redirige al checkout de Wompi
  └── Usuario completa el pago en la plataforma de Wompi
  └── Wompi llama al webhook: POST /api/webhooks/wompi
  └── Backend verifica firma HMAC del webhook
  └── Si pago aprobado:
        ├── Backend crea pedido en Dropi API
        ├── Backend envía email de confirmación al cliente
        └── Backend redirige frontend a /confirmacion?order_id=XXX

── Ruta B: MERCADOPAGO ──

Usuario hace clic "Confirmar pedido"
  └── Frontend llama: POST /api/payments/mercadopago
  └── Backend crea preferencia en MP API
  └── Backend retorna preference_id
  └── Frontend renderiza el Brick de MercadoPago
  └── Usuario completa el pago en el Brick
  └── MP notifica al webhook: POST /api/webhooks/mercadopago
  └── Backend verifica y confirma
  └── Si pago aprobado:
        ├── Backend crea pedido en Dropi API
        ├── Backend envía email de confirmación al cliente
        └── Backend redirige frontend a /confirmacion?order_id=XXX

── Ruta C: COD (Contra Entrega) ──

Usuario hace clic "Confirmar pedido"
  └── Frontend llama: POST /api/orders (con payment_method: "COD")
  └── Backend crea pedido en Dropi API directamente (sin pasarela)
  └── Dropi confirma pedido COD
  └── Backend envía email de confirmación al cliente
  └── Frontend navega a /confirmacion?order_id=XXX

ESTADO: Error en el pago
  └── Sistema muestra mensaje de error específico
  └── Usuario puede intentar de nuevo o cambiar método de pago
  └── Sistema NO crea pedido en Dropi si el pago falla
```

---

## 8. FLUJO 6 — CONFIRMACIÓN DE PEDIDO

```
ENTRADA: Usuario llega a /confirmacion?order_id=XXX
  └── Pixel: Purchase (con value, currency, order_id, contents)

SISTEMA muestra:
  ├── ✅ Ícono de éxito
  ├── Mensaje: "¡Pedido confirmado! Gracias por tu compra"
  ├── Número de pedido
  ├── Resumen del pedido (productos, total, dirección)
  ├── Tiempo estimado de entrega
  ├── Instrucciones según método de pago:
  │     ├── Wompi/MP: "Recibirás un email con los detalles"
  │     └── COD: "Ten listo el dinero al momento de la entrega"
  └── Botones:
        ├── "Seguir comprando" → Home
        └── "Consultar estado por WhatsApp" → Chatea Pro

TRIGGER automático post-confirmación:
  ├── Email de confirmación → cliente (vía Hostinger SMTP)
  ├── Pedido creado en Dropi → operador
  └── (v2) Mensaje de WhatsApp automático vía Chatea Pro

PROTECCIÓN:
  └── Si el usuario llega a /confirmacion sin order_id válido
  └── Sistema redirige al Home (evita page views fantasma en Pixel)
```

---

## 9. FLUJO 7 — WHATSAPP BOT (CHATEA PRO)

### 9.1 Entrada por botón flotante o botón de producto
```
PASO 1: Usuario hace clic en el botón de WhatsApp
  └── Desde botón flotante: abre WhatsApp con mensaje genérico
        "Hola Novainvesa, necesito ayuda 👋"
  └── Desde página de producto: abre WhatsApp con mensaje específico
        "Hola! Me interesa: [nombre del producto] - $[precio]"

PASO 2: Bot de Chatea Pro responde automáticamente (< 5 seg)
  └── "¡Hola! Bienvenido a Novainvesa 👋
       ¿En qué te podemos ayudar hoy?"

MENÚ PRINCIPAL (botones interactivos):
  [1] 🛍️ Ver productos / Catálogo
  [2] 📦 Hacer un pedido
  [3] 🔍 Estado de mi pedido
  [4] ❓ Preguntas frecuentes
  [5] 👤 Hablar con un asesor
```

### 9.2 Sub-flujo: Hacer un pedido por WhatsApp
```
Usuario selecciona [2] Hacer un pedido
  └── Bot: "¿Qué categoría te interesa?"
  └── Botones: [Mascotas] [Hogar] [Tecnología] [Belleza] [Fitness]

Usuario selecciona categoría
  └── Bot envía: imagen + nombre + precio del producto destacado
  └── Bot: "¿Te interesa este producto?"
  └── Botones: [✅ Sí, comprarlo] [👀 Ver otro] [⬅️ Volver]

Usuario selecciona [✅ Sí, comprarlo]
  └── Bot: "¡Perfecto! Para procesar tu pedido necesito:"
  └── Bot solicita datos uno a uno:
        1. Nombre completo
        2. Número de cédula
        3. Ciudad y dirección de entrega
        4. Número de teléfono de contacto

Bot confirma datos:
  └── "Estos son tus datos: [resumen]
       ¿Confirmas el pedido?"
  └── Botones: [✅ Confirmar] [✏️ Corregir datos]

Usuario confirma:
  └── Bot: "¡Pedido registrado! 🎉
       Tu número de pedido es: #XXXX
       Te contactaremos en máximo 2 horas para confirmar."
  └── Operador registra el pedido manualmente en Dropi (v1)
  └── (v2) Backend registra automáticamente vía API
```

### 9.3 Sub-flujo: Preguntas frecuentes (FAQ)
```
Usuario selecciona [4] Preguntas frecuentes
  └── Bot muestra lista de preguntas:

  [1] ¿Hacen envíos a todo Colombia?
        → "Sí, hacemos envíos a todas las ciudades principales
           de Colombia a través de nuestra red logística."

  [2] ¿Cuánto demora el envío?
        → "Entre 3 y 7 días hábiles dependiendo de tu ciudad."

  [3] ¿Aceptan pago contra entrega?
        → "Sí, disponible en ciudades con cobertura de nuestra
           red logística. ¡Sin pago previo!"

  [4] ¿Puedo devolver un producto?
        → "Sí, tienes 5 días hábiles desde la recepción.
           Escríbenos aquí mismo para gestionar la devolución."

  [5] ¿Cómo hago para comprar?
        → "Visita nuestra tienda en www.novainvesa.com o
           dinos qué producto te interesa aquí mismo."

  [6] ⬅️ Volver al menú principal
```

### 9.4 Sub-flujo: Transferencia a humano
```
Usuario selecciona [5] Hablar con un asesor
  └── Bot: "Voy a transferirte con un asesor.
            Tiempo de espera estimado: pocos minutos."
  └── Sistema notifica al operador (Chatea Pro dashboard)
  └── Operador toma control de la conversación
  └── Cuando el operador responde, el bot queda en modo manual

CONDICIÓN de retorno automático a bot:
  └── Si el operador no responde en 30 minutos
  └── Bot retoma con: "Estamos atendiendo tu solicitud,
       te responderemos pronto. ¿Hay algo más en lo que pueda
       ayudarte mientras?"

FUERA DE HORARIO (configurable en Chatea Pro):
  └── Bot: "Estamos fuera de horario de atención.
            Nuestro horario es de Lunes a Sábado, 8am - 8pm.
            Te responderemos en cuanto abramos. ¡Gracias!"
```

---

## 10. FLUJO 8 — RECUPERACIÓN DE CARRITO ABANDONADO

### v1 — Manual
```
CONDICIÓN: Usuario inició checkout pero no completó la compra

ACCIÓN manual del operador:
  └── Revisar abandonos en Meta Ads (audience de visitantes sin Purchase)
  └── Crear campaña de retargeting apuntando a esa audiencia
  └── Anuncio muestra los productos que vio el usuario
```

### v2 — Automatizado con Chatea Pro
```
CONDICIÓN: Usuario dio clic en "Ir al Checkout" (InitiateCheckout)
           pero no completó la compra en los siguientes 60 minutos

SISTEMA (webhook del frontend → Chatea Pro):
  └── Chatea Pro envía mensaje de WhatsApp automático:

  Bot: "Hola [nombre] 👋, notamos que dejaste
        productos en tu carrito en Novainvesa 🛒
        ¿Te podemos ayudar a completar tu pedido?"
  Botones: [✅ Sí, completar] [❌ No, gracias]

Si [✅ Sí, completar]:
  └── Bot envía link directo al carrito: www.novainvesa.com/carrito
  └── O inicia flujo de pedido por WhatsApp

Si [❌ No, gracias]:
  └── Bot: "¡Entendido! Cuando quieras nos encuentras
            en www.novainvesa.com o aquí mismo. 😊"
  └── Bot no vuelve a escribir por 72 horas
```

---

## 11. FLUJO 9 — SEGUIMIENTO DE PEDIDO

### v1
```
ENTRADA: Cliente escribe por WhatsApp preguntando por su pedido

Bot: "¿Cuál es tu número de pedido o tu cédula?"
  └── Cliente responde con el número

Bot: "Dame un momento, voy a consultar tu pedido..."
  └── Sistema notifica al operador (Chatea Pro dashboard)
  └── Operador consulta en Dropi dashboard
  └── Operador responde manualmente con el estado

Estados posibles de Dropi:
  ├── Pedido recibido
  ├── En preparación
  ├── Enviado (con número de guía)
  ├── En camino
  ├── Entregado
  └── No entregado / Devuelto
```

### v2 — Integración directa con Dropi API
```
Bot consulta directamente a: GET /api/tracking/:order_id
  └── Backend consulta Dropi API en tiempo real
  └── Bot responde automáticamente con el estado actualizado
  └── Sin intervención humana necesaria
```

---

## 12. FLUJO 10 — ADMINISTRADOR DE ANUNCIOS META

### Flujo del operador para lanzar una campaña
```
PASO 1: Acceder a Meta Business Suite
  └── business.facebook.com → cuenta de Novainvesa

PASO 2: Ir al Administrador de Anuncios
  └── Menú → Administrador de anuncios

PASO 3: Crear nueva campaña
  └── Clic en "+" → Nueva campaña
  └── Objetivo: Conversiones → Compras
  └── Nombre: "Mascotas — Conversiones — Colombia — [fecha]"

PASO 4: Configurar conjunto de anuncios
  └── Evento de conversión: Purchase (del Pixel instalado)
  └── Presupuesto: $5 USD/día
  └── Público:
        ├── Ubicación: Colombia (+ departamentos específicos si aplica)
        ├── Edad: 18-55 años
        ├── Idioma: Español
        └── Intereses: [relacionados con la categoría]
  └── Placements: Automático (Facebook + Instagram + Reels)

PASO 5: Crear anuncio
  └── Identidad: Página de Novainvesa + Instagram @novainvesa
  └── Formato: Video (Reels/Stories) o Imagen
  └── Subir creativo (video 15-30 seg o imagen 1080x1080)
  └── Texto principal: copy del producto
  └── Título: nombre del producto + precio
  └── CTA: "Comprar ahora"
  └── URL de destino: www.novainvesa.com/producto/:id
  └── Parámetros UTM: ?utm_source=facebook&utm_medium=paid&utm_campaign=mascotas

PASO 6: Revisar y publicar
  └── Revisar resumen de la campaña
  └── Verificar que el Pixel esté activo en la URL de destino
  └── Clic en "Publicar"
  └── Estado: "En revisión" (Meta revisa en ~1-24 horas)
  └── Estado: "Activo" → campaña corriendo

PASO 7: Monitoreo diario
  └── Revisar métricas:
        ├── Alcance e impresiones
        ├── CTR (Click Through Rate) — objetivo > 1.5%
        ├── CPM (Costo por 1000 impresiones)
        ├── CPC (Costo por clic)
        ├── Compras atribuidas
        ├── ROAS (objetivo mínimo: 2x)
        └── Costo por compra (objetivo: < 50% del margen)

DECISIONES de optimización:
  ├── ROAS > 3x → aumentar presupuesto 20% cada 3 días
  ├── ROAS < 1x después de 3 días → pausar y cambiar creativo
  ├── CTR < 0.8% → cambiar el creativo / copy
  └── CPC muy alto → revisar relevancia del público
```

---

## 13. ESTADOS DE UN PEDIDO

```
CREADO
   └── Pedido registrado en sistema (Dropi + Novainvesa)
   └── Email enviado al cliente
   └── WhatsApp de confirmación (v2)
      ↓
EN PREPARACIÓN
   └── Dropi está alistando el paquete
      ↓
ENVIADO
   └── Paquete en manos del transportista
   └── Número de guía disponible
   └── Notificación al cliente (v2: WhatsApp automático)
      ↓
EN CAMINO
   └── En ruta hacia la dirección de entrega
      ↓
   ┌──────────────────────────────────┐
   │                                  │
ENTREGADO ✅              NO ENTREGADO ❌
   └── Proceso                └── Dropi reintenta
       finalizado                  o devuelve al vendedor
   └── (v2) Bot pide         └── Operador contacta
       reseña al cliente          al cliente
```

---

## 14. RESUMEN DE EVENTOS DEL META PIXEL POR FLUJO

| Flujo | Página / Acción | Evento Pixel |
|---|---|---|
| Cualquier página | Carga de página | PageView |
| Búsqueda | Escribe en buscador | Search |
| Producto | Ve página de producto | ViewContent |
| Carrito | Agrega producto | AddToCart |
| Checkout | Entra al checkout | InitiateCheckout |
| Confirmación | Pedido completado | Purchase |
| WhatsApp | Clic en botón de contacto | Contact |

---

*Documento vivo — versión 1.0*  
*Documento anterior: Arquitectura Técnica (2 de 8) | Próximo: Contrato de API (4 de 8)*
