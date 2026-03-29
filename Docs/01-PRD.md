# PRD — Product Requirements Document
## Novainvesa | Tienda de Dropshipping Multi-Categoría
**Versión:** 1.2  
**Fecha:** Marzo 2026  
**Estado:** Borrador  
**Autor:** Fundador / Operador

---

## 1. RESUMEN EJECUTIVO

**Novainvesa** es una tienda de e-commerce de dropshipping multi-categoría orientada al mercado colombiano y latinoamericano. Opera bajo el modelo de dropshipping usando Dropi como proveedor principal, lo que elimina la necesidad de inventario físico. La tienda permite a cualquier tipo de comprador online adquirir productos de distintas categorías (Mascotas, Hogar, Tecnología, Belleza y Fitness) con múltiples métodos de pago y entrega contra reembolso.

**Dominio:** www.novainvesa.com  
**Hosting:** Hostinger (plan activo)  
**Lanzamiento objetivo:** 4 semanas desde inicio del desarrollo

---

## 2. PROBLEMA QUE RESUELVE

Los compradores latinoamericanos enfrentan:
- Poca variedad de productos en tiendas locales
- Desconfianza en el pago online anticipado
- Tiempos de envío largos desde plataformas internacionales (AliExpress, Amazon)
- Interfaces en otros idiomas

Novainvesa resuelve esto ofreciendo una tienda local, con pago contra entrega disponible, interfaz en español (+ inglés y portugués), y productos entregados en tiempos razonables gracias a la logística de Dropi con bodega en LATAM.

---

## 3. OBJETIVOS DEL PRODUCTO

### Objetivos de negocio (primeros 3 meses)
- Generar las primeras 10 ventas en el primer mes
- Alcanzar un ROAS (retorno en publicidad) mínimo de 2x en Meta Ads
- Validar al menos 1 producto ganador por categoría
- Recuperar la inversión inicial en publicidad (~$190 USD)

### Objetivos del producto
- Tienda 100% funcional desde el día 1 del lanzamiento
- Checkout con tasa de abandono menor al 70%
- Tiempo de carga de página menor a 3 segundos
- Compatible con móviles (80%+ del tráfico vendrá de celular)
- Integración automática con Dropi para creación de pedidos

---

## 4. USUARIOS Y MERCADO

### Mercado objetivo
- **Principal:** Colombia
- **Secundario:** México, Perú, Chile, Ecuador
- **Proyección:** Toda LATAM en v2

### Perfil del comprador
- Cualquier persona que compra online (perfil mixto)
- Mayor concentración en dispositivos móviles
- Habla español como idioma principal
- Puede o no tener tarjeta de crédito/débito (por eso se ofrece COD)
- Descubre productos principalmente por redes sociales (Meta Ads)

### Idiomas soportados
| Idioma | Estado | Notas |
|---|---|---|
| Español | Principal | Idioma por defecto |
| Inglés | Secundario | Seleccionable por botón |
| Portugués | Secundario | Para mercado brasileño futuro |

---

## 5. CATEGORÍAS DE PRODUCTOS (v1)

Todas las categorías arrancan con productos básicos (mínimo 4 por categoría) y son escalables en cualquier momento editando el archivo de configuración.

| # | Categoría | Slug | Estado en v1 |
|---|---|---|---|
| 1 | Mascotas | /categoria/mascotas | ✅ Activa |
| 2 | Hogar / Organización | /categoria/hogar | ✅ Activa |
| 3 | Tecnología / Gadgets | /categoria/tecnologia | ✅ Activa |
| 4 | Belleza / Skincare | /categoria/belleza | ✅ Activa |
| 5 | Fitness / Salud | /categoria/fitness | ✅ Activa |

**Nota de escalabilidad:** Agregar una nueva categoría en el futuro requiere únicamente añadir un objeto al archivo `src/config/categories.js`. No se requieren cambios en enrutamiento, navbar ni páginas.

---

## 6. PÁGINAS Y FLUJOS REQUERIDOS

### 6.1 Páginas principales

| Ruta | Nombre | Descripción |
|---|---|---|
| `/` | Home | Hero, categorías destacadas, productos destacados |
| `/categoria/:slug` | Página de categoría | Grid de productos filtrados por categoría |
| `/producto/:id` | Página de producto | Detalle, imágenes, precio, botón de compra |
| `/carrito` | Carrito | Resumen de productos seleccionados |
| `/checkout` | Checkout | Formulario de datos + selección de método de pago |
| `/confirmacion` | Confirmación | Página de éxito post-compra (dispara Pixel) |
| `/buscar` | Búsqueda | Resultados de búsqueda por texto |
| `/politica-privacidad` | Política de privacidad | Requerida por Meta Ads |
| `/terminos` | Términos y condiciones | Legal |
| `/sobre-nosotros` | Sobre Nosotros | Información de la tienda |

### 6.2 Flujo principal del usuario

```
Anuncio en Meta Ads
       ↓
Landing / Página de producto
       ↓
Agregar al carrito
       ↓
Ver carrito → (opcional: seguir comprando)
       ↓
Ir al checkout
       ↓
Ingresar datos personales + dirección
       ↓
Seleccionar método de pago
  ├── Wompi (PSE, Nequi, Bancolombia, Tarjeta)
  ├── MercadoPago (Daviplata, Tarjeta, ML)
  └── Contra entrega (COD vía Dropi)
       ↓
Confirmar pedido
       ↓
Página de confirmación (Pixel de compra disparado)
       ↓
Email de confirmación automático (Brevo/Hostinger)
       ↓
Backend crea pedido automáticamente en Dropi
       ↓
Dropi gestiona envío al cliente
```

---

## 7. MÉTODOS DE PAGO

| Pasarela | Métodos incluidos | Mercado | Comisión aprox. |
|---|---|---|---|
| **Wompi** | PSE, Nequi, Bancolombia, Tarjetas | Colombia | 2.9% + $900 COP |
| **MercadoPago** | Daviplata, Tarjeta, MercadoPago | Colombia + LATAM | 3.49% |
| **COD (Dropi)** | Contra entrega en efectivo | Colombia + LATAM | Gestionado por Dropi |

**Regla de negocio:** El COD solo está disponible para pedidos dentro de las ciudades con cobertura de Dropi. Si el sistema detecta una dirección fuera de cobertura, el COD se deshabilita automáticamente en el checkout.

---

## 8. PROVEEDOR: DROPI

### Integración requerida
- Crear pedido automáticamente al confirmar una compra (pago online o COD)
- Consultar estado del pedido para mostrar tracking al cliente
- Sincronizar catálogo de productos (manual en v1, automático en v2)

### Flujo de pedido con Dropi
```
Compra confirmada → Backend llama API de Dropi → Dropi crea el pedido
→ Dropi gestiona empaque y envío → Cliente recibe el producto
→ En COD: Dropi recoge el pago y transfiere al vendedor (menos comisión)
```

---

## 9. STACK TECNOLÓGICO

| Capa | Tecnología | Hosting | Costo |
|---|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Hostinger (build estático) | $0 adicional |
| Backend | Node.js + Express | Render.com (free tier) | $0 |
| Base de datos | Sin DB en v1 (todo vía Dropi API) | N/A | $0 |
| Pagos | Wompi SDK + MercadoPago SDK | Integrado en backend | $0 |
| Email transaccional | Email profesional Hostinger | Hostinger | Incluido |
| Analytics | Meta Pixel + Google Analytics 4 | CDN | $0 |
| Dominio | www.novainvesa.com | Hostinger | Pagado |
| i18n (idiomas) | i18next (React) | Incluido en frontend | $0 |

---

## 10. REQUISITOS NO FUNCIONALES

### Rendimiento
- Tiempo de carga inicial (LCP): < 3 segundos en móvil con 4G
- Build de producción optimizado con Vite (code splitting, lazy loading)
- Imágenes optimizadas (WebP, lazy load)

### Compatibilidad
- Mobile-first (diseñado primero para celular)
- Compatible con: Chrome, Firefox, Safari, Samsung Internet
- Resoluciones: 375px (móvil) → 768px (tablet) → 1280px+ (escritorio)

### Seguridad
- HTTPS obligatorio (SSL de Hostinger)
- Variables de entorno para todas las claves API
- Validación de datos en frontend y backend
- Webhooks de pago verificados con firma digital

### Internacionalización
- Botón visible en navbar para cambiar idioma (ES / EN / PT)
- Textos almacenados en archivos JSON por idioma
- Idioma persistido en localStorage
- Precios siempre en COP (la moneda no cambia con el idioma)

---

## 11. OPERACIÓN DEL NEGOCIO

### Operador
- **Equipo inicial:** 1 persona (fundador)
- **Responsabilidades:** Gestión de pedidos, atención al cliente, publicidad en Meta Ads, actualización de productos

### Canales de atención al cliente
| Canal | Herramienta | Rol |
|---|---|---|
| WhatsApp Business | Chatea Pro (bot) | Principal — atención 24/7 automatizada + cierre de ventas |
| Email | Hostinger Email | Confirmaciones automáticas de pedidos |
| Redes sociales | Meta Business Suite | Mensajes DM de Facebook e Instagram |

### Email profesional (Hostinger)
| Cuenta | Uso |
|---|---|
| contacto@novainvesa.com | Atención al cliente general |
| pedidos@novainvesa.com | Confirmaciones de compra |
| soporte@novainvesa.com | Reclamaciones y seguimiento |

---

## 12. PUBLICIDAD — META ADS (Facebook e Instagram)

### 12.1 Configuración del Administrador de Anuncios

#### Activos a crear y configurar
| Activo | Descripción | Prioridad |
|---|---|---|
| Cuenta publicitaria | Cuenta de Meta Ads vinculada a www.novainvesa.com | 🔴 Crítica |
| Página de Facebook | Página oficial de Novainvesa | 🔴 Crítica |
| Perfil de Instagram | @novainvesa (vinculado a la página) | 🔴 Crítica |
| Meta Pixel | Código de seguimiento instalado en la tienda | 🔴 Crítica |
| Catálogo de productos | Catálogo con los productos de la tienda | 🟡 Importante |
| Meta Business Suite | Panel central para gestionar todo | 🔴 Crítica |
| Conversions API | API del servidor para rastreo más preciso | 🟢 Recomendada |

#### Pasos de configuración del Administrador de Anuncios
1. Crear cuenta en **Meta Business Suite** (business.facebook.com)
2. Crear o vincular la **Página de Facebook** de Novainvesa
3. Vincular el **perfil de Instagram** @novainvesa
4. Crear la **cuenta publicitaria** en Business Settings
5. Crear el **Meta Pixel** y copiarlo en el código de la tienda
6. Verificar el **dominio www.novainvesa.com** desde Business Settings
7. Configurar los **eventos de conversión** en el Pixel (Purchase como principal)
8. Crear el **catálogo de productos** y sincronizarlo con la tienda
9. Configurar **método de pago** para las campañas (tarjeta de crédito)
10. Activar la **Conversions API** para mejorar la atribución (backend)

### 12.2 Estructura de Campañas en Meta Ads

#### Tipo de campañas a usar
| Fase | Tipo de campaña | Objetivo | Presupuesto sugerido |
|---|---|---|---|
| **Fase 1 — Testing** | Conversiones | Compras | $5-8 USD/día por conjunto |
| **Fase 2 — Escalar** | Conversiones | Compras | $15-30 USD/día en ganadores |
| **Fase 3 — Retargeting** | Retargeting | Compras | $5 USD/día |

#### Estructura de una campaña (por categoría)
```
CAMPAÑA: [Categoría] — Conversiones — Colombia
│
├── CONJUNTO DE ANUNCIOS 1: Intereses amplios
│   ├── Público: Colombia, 18-45 años
│   ├── Intereses: relacionados con la categoría
│   └── Presupuesto: $5 USD/día
│
├── CONJUNTO DE ANUNCIOS 2: Lookalike (cuando haya datos)
│   ├── Público: Similar al 1% de compradores
│   └── Presupuesto: $5 USD/día
│
└── CONJUNTO DE ANUNCIOS 3: Retargeting
    ├── Público: Visitantes de los últimos 14 días que no compraron
    └── Presupuesto: $3 USD/día
```

#### Categorías de lanzamiento prioritarias para v1
1. **Mascotas** — Mayor engagement en videos, compra emocional
2. **Hogar** — Alta viralidad en reels, compra por impulso
3. **Tecnología** — Ticket más alto, bien para prospectos

### 12.3 Eventos de Pixel requeridos
| Evento | Dónde se dispara | Prioridad |
|---|---|---|
| PageView | Todas las páginas | 🔴 Crítico |
| ViewContent | Página de producto | 🔴 Crítico |
| AddToCart | Al agregar al carrito | 🔴 Crítico |
| InitiateCheckout | Al ir al checkout | 🔴 Crítico |
| Purchase | Página de confirmación | 🔴 Crítico |
| Search | Página de búsqueda | 🟡 Importante |
| Contact | Click en WhatsApp/email | 🟢 Opcional |

### 12.4 Formatos de creativos para los anuncios
| Formato | Uso | Duración/Tamaño |
|---|---|---|
| Video vertical (Reels/Stories) | Principal — mayor alcance | 15-30 seg, 9:16 |
| Video cuadrado (Feed) | Complementario | 15-30 seg, 1:1 |
| Imagen estática | Remarketing | 1080x1080 px |
| Carrusel | Mostrar variedad de productos | 3-5 tarjetas |

### 12.5 Presupuesto inicial
- **Total disponible:** ~$190 USD
- **Distribución sugerida:**
  - $150 USD — campañas de conversión (testing de productos)
  - $40 USD — reserva para escalar el ganador

---

## 13. CHATBOT DE WHATSAPP — CHATEA PRO

### 13.1 Objetivo del chatbot
El bot de WhatsApp de Novainvesa tiene **dos funciones principales:**
1. **Informar** — Responder preguntas frecuentes automáticamente (catálogo, precios, envíos, estados de pedido)
2. **Cerrar ventas** — Guiar al cliente interesado hasta confirmar su compra por WhatsApp como canal alternativo a la tienda web

### 13.2 Herramienta: Chatea Pro
- Plataforma de automatización para WhatsApp Business API
- Permite crear flujos de conversación (chatflows) visuales
- Integra con WhatsApp Business API oficial (Meta)
- Permite transferir la conversación a humano cuando sea necesario
- Soporta envío de imágenes, botones, listas y mensajes interactivos

### 13.3 Flujos del chatbot a construir

#### Flujo 1 — Bienvenida (entrada principal)
```
Cliente escribe cualquier mensaje
         ↓
Bot saluda: "¡Hola! Bienvenido a Novainvesa 👋
¿En qué te podemos ayudar hoy?"
         ↓
Menú de opciones (botones):
  [1] Ver productos / Catálogo
  [2] Hacer un pedido
  [3] Estado de mi pedido
  [4] Preguntas frecuentes
  [5] Hablar con un asesor
```

#### Flujo 2 — Ver catálogo / Hacer pedido
```
Cliente selecciona "Ver productos" o "Hacer un pedido"
         ↓
Bot muestra categorías:
  [🐾 Mascotas] [🏠 Hogar] [📱 Tecnología]
  [💄 Belleza] [💪 Fitness]
         ↓
Cliente selecciona categoría
         ↓
Bot envía: imagen del producto + precio + descripción corta
         ↓
"¿Te interesa este producto?"
  [✅ Sí, quiero comprarlo] [👀 Ver otro producto]
         ↓
Si compra → Bot toma datos (nombre, dirección, ciudad)
         ↓
Bot confirma pedido → Operador lo registra en Dropi manualmente
         ↓ (en v2 se automatiza con API)
"¡Pedido registrado! Te confirmamos en menos de 2 horas."
```

#### Flujo 3 — Estado del pedido
```
Cliente selecciona "Estado de mi pedido"
         ↓
Bot pregunta: "¿Cuál es tu número de pedido o cédula?"
         ↓
Operador responde manualmente (v1)
         ↓ (en v2 se conecta con API de Dropi)
Bot envía estado del pedido
```

#### Flujo 4 — Preguntas frecuentes (FAQ)
```
¿Hacen envíos a todo Colombia? → Respuesta automática
¿Cuánto demora el envío? → Respuesta automática
¿Aceptan pago contra entrega? → Respuesta automática
¿Puedo devolver un producto? → Respuesta automática
¿Cómo compro? → Link directo a www.novainvesa.com
```

#### Flujo 5 — Recuperación de carrito abandonado
```
(Disparado manualmente o por webhook en v2)
Bot envía: "Hola [nombre], vimos que dejaste
productos en tu carrito en Novainvesa 🛒
¿Quieres que te ayudemos a completar tu pedido?"
  [✅ Sí, completar pedido] [❌ No, gracias]
```

### 13.4 Integración con la tienda web
| Punto de integración | Detalle |
|---|---|
| Botón flotante en la tienda | Ícono de WhatsApp fijo en todas las páginas → abre chat |
| Página de producto | Botón "Consultar por WhatsApp" con mensaje predefinido |
| Página de confirmación | Bot envía mensaje de bienvenida post-compra |
| Carrito abandonado (v2) | Webhook → Bot envía recordatorio automático |

### 13.5 Configuración requerida en Chatea Pro
1. Conectar número de WhatsApp Business a Chatea Pro
2. Vincular el número a WhatsApp Business API (Meta)
3. Crear los 5 flujos descritos arriba
4. Configurar horario de atención (fuera de horario → mensaje automático)
5. Configurar transferencia a humano cuando el bot no entiende
6. Integrar link de WhatsApp en la tienda web (botón flotante)

### 13.6 KPIs del chatbot
| Métrica | Meta inicial |
|---|---|
| Tasa de respuesta del bot | > 80% de mensajes sin intervención humana |
| Tasa de conversión por WhatsApp | > 5% de chats → venta |
| Tiempo de respuesta automática | < 5 segundos |
| Chats escalados a humano | < 20% del total |

---

## 14. ROADMAP DE DESARROLLO

| Semana | Entregables |
|---|---|
| **Semana 1** | Documento 1 (PRD ✅), Documento 2 (Arquitectura), Documento 3 (Flujos), Documento 4 (API Contract) |
| **Semana 1-2** | Documento 5 (Modelo de datos), Documento 6 (Design System), Documento 7 (Reglas de negocio), Documento 8 (Plan Meta Ads + Chatea Pro) |
| **Semana 2** | Setup Meta Business Suite + Pixel + Cuenta publicitaria + Verificación dominio |
| **Semana 2** | Setup Chatea Pro: número WhatsApp Business API + flujos del bot (bienvenida, catálogo, FAQ) |
| **Semana 2-3** | Setup del proyecto (React + Vite), estructura de carpetas, configuración de categorías, componentes base |
| **Semana 3** | Páginas: Home, Categoría, Producto, Carrito + botón flotante de WhatsApp |
| **Semana 3-4** | Checkout + integración Wompi + MercadoPago + COD |
| **Semana 4** | Backend (Node/Express), integración Dropi API, emails automáticos |
| **Semana 4** | Meta Pixel en todos los eventos, GA4, pruebas finales, deploy a Hostinger |
| **Post-lanzamiento** | Primera campaña Meta Ads (Mascotas + Hogar), activar flujo de recuperación de carrito en Chatea Pro, análisis de resultados |

---

## 15. CRITERIOS DE ÉXITO (Definition of Done)

La tienda está lista para lanzar cuando:

- [ ] Todas las páginas cargan en menos de 3 segundos en móvil
- [ ] El flujo completo de compra funciona de inicio a fin (con pago real)
- [ ] Los pedidos se crean automáticamente en Dropi
- [ ] Los 3 métodos de pago están activos y probados
- [ ] El Meta Pixel dispara los 5 eventos correctamente
- [ ] El dominio www.novainvesa.com está verificado en Meta Business Suite
- [ ] La cuenta publicitaria está activa y con método de pago configurado
- [ ] La primera campaña de Meta Ads está lista para activarse
- [ ] El bot de WhatsApp (Chatea Pro) responde automáticamente los 5 flujos
- [ ] El botón flotante de WhatsApp está visible en todas las páginas de la tienda
- [ ] Los emails de confirmación llegan al cliente
- [ ] La tienda es 100% responsive en móvil
- [ ] El cambio de idioma funciona (ES/EN/PT)
- [ ] Las páginas legales están completas (obligatorio para Meta Ads)
- [ ] El SSL está activo en www.novainvesa.com

---

## 16. FUERA DE ALCANCE (v1) — PLANIFICADO PARA v2

Los siguientes elementos NO se construyen en v1:

- ~~Sistema de cuentas de usuario / login~~ → MOVIDO A v1
- ~~Panel de administración propio~~ → MOVIDO A v1
- Programa de referidos
- Blog o contenido SEO
- Integración con Google Shopping
- Soporte para múltiples monedas
- Automatización de pedidos por WhatsApp (integración Chatea Pro → Dropi API)
- Recuperación automática de carrito por WhatsApp (webhook)
- Reseñas y calificaciones de productos
- Campañas de retargeting avanzadas (Lookalike Audiences)

---

## 17. VISIÓN v2 — APLICACIÓN MÓVIL

### 17.1 Objetivo
Llevar Novainvesa a una **aplicación móvil nativa multiplataforma** compatible con Web, iOS y Android, manteniendo una única base de código compartida con la tienda web actual.

### 17.2 Tecnología: React Native + Expo

La elección de React Native con Expo es estratégica porque:
- El equipo ya conoce **React** (base de v1)
- **Una sola base de código** cubre iOS, Android y Web
- **Expo** simplifica el build, deploy y actualizaciones OTA (sin pasar por App Store en cada cambio)
- Compatible con la arquitectura actual del proyecto

```
v1 — Tienda Web          v2 — App Móvil
React + Vite             React Native + Expo
     ↓                         ↓
Hostinger             App Store + Google Play
                       + Web (mismo código)
```

### 17.3 Plataformas objetivo

| Plataforma | Tecnología | Distribución |
|---|---|---|
| Web | React Native Web (Expo) | www.novainvesa.com |
| iOS | React Native + Expo | App Store (Apple) |
| Android | React Native + Expo | Google Play Store |

### 17.4 Componentes compartidos entre v1 y v2

La arquitectura de v1 está diseñada para facilitar la migración a v2:

| Capa | v1 (Web) | v2 (App) | ¿Reutilizable? |
|---|---|---|---|
| Lógica de negocio | `services/` JS puro | Igual | ✅ 100% |
| Integración Dropi | `dropi.service.js` | Igual | ✅ 100% |
| Integración pagos | Wompi + MP SDK | SDKs móviles | ⚠️ Adaptación |
| Estado (carrito) | Context API | Context API | ✅ 100% |
| Componentes UI | React JSX | React Native JSX | ⚠️ Adaptación |
| i18n (idiomas) | i18next | i18next | ✅ 100% |
| Config categorías | `categories.js` | Igual | ✅ 100% |

### 17.5 Nuevas funcionalidades exclusivas de la app móvil

| Funcionalidad | Descripción | Prioridad |
|---|---|---|
| **Push Notifications** | Alertas de estado de pedido, promociones, carrito abandonado | 🔴 Alta |
| **Login social** | Registro con Google / Facebook | 🔴 Alta |
| **Historial de pedidos** | El usuario ve todos sus pedidos anteriores | 🔴 Alta |
| **Wishlist / Favoritos** | Guardar productos para después | 🟡 Media |
| **Biometría en checkout** | Face ID / Huella para confirmar compra rápida | 🟡 Media |
| **Modo offline** | Ver catálogo sin internet (datos en caché) | 🟢 Baja |
| **Compartir producto** | Share nativo del sistema operativo | 🟡 Media |
| **Reseñas con foto** | El comprador sube foto de su producto recibido | 🟡 Media |
| **Rastreo de pedido** | Mapa en tiempo real del estado de envío | 🟢 Baja |

### 17.6 Integración WhatsApp en la app
- Botón de WhatsApp abre directamente el chat nativo del teléfono
- Chatea Pro sigue funcionando igual — no requiere cambios en el bot
- Las notificaciones push reemplazan los mensajes manuales de seguimiento

### 17.7 Requisitos para publicar en tiendas

#### Apple App Store
- Cuenta de desarrollador Apple: **$99 USD/año**
- Revisión manual de Apple (3-7 días hábiles)
- Cumplir con las guías de diseño Human Interface Guidelines
- Política de privacidad obligatoria (ya incluida en v1)

#### Google Play Store
- Cuenta de desarrollador Google: **$25 USD único pago**
- Revisión automática + manual (1-3 días hábiles)
- APK o AAB firmado con keystore propio

### 17.8 Stack completo v2

| Capa | Tecnología |
|---|---|
| App móvil + Web | React Native + Expo SDK |
| Navegación | React Navigation v6 |
| Estilos | NativeWind (Tailwind para RN) |
| Estado global | Context API + Zustand |
| Push Notifications | Expo Notifications + Firebase FCM |
| Autenticación | Expo Auth Session (Google/Facebook OAuth) |
| Pagos iOS | Apple Pay via Stripe SDK |
| Pagos Android | Google Pay via Stripe SDK |
| Pagos Colombia | Wompi + MercadoPago (WebView en v2.0, SDK nativo en v2.1) |
| Analytics | Firebase Analytics + Meta Pixel (web) |
| OTA Updates | Expo Updates (cambios sin pasar por App Store) |
| Backend | Node.js + Express (mismo de v1, sin cambios) |

### 17.9 Roadmap v2

| Fase | Duración estimada | Contenido |
|---|---|---|
| **v2.0 — MVP App** | 6-8 semanas post v1 | Tienda completa en app, login, historial de pedidos |
| **v2.1 — Pagos nativos** | 2-3 semanas | Apple Pay, Google Pay, SDKs nativos de Wompi/MP |
| **v2.2 — Engagement** | 3-4 semanas | Push notifications, wishlist, reseñas, compartir |
| **v2.3 — Optimización** | 2 semanas | Modo offline, biometría, rastreo de pedido |

### 17.10 Presupuesto estimado v2

| Ítem | Costo estimado |
|---|---|
| Apple Developer Account | $99 USD/año |
| Google Play Developer | $25 USD (único pago) |
| Expo EAS Build (builds en la nube) | $0 (free tier) o $29 USD/mes |
| Firebase (Push Notifications) | $0 (free tier cubre el inicio) |
| **Total mínimo para publicar** | **~$124 USD** |

---

*Documento vivo — versión 1.2 actualizada con visión v2 App Móvil.*  
*Próximo documento: Arquitectura Técnica (Documento 2 de 8)*
