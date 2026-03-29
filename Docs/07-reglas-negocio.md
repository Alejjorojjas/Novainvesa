# Reglas de Negocio
## Novainvesa | Tienda de Dropshipping Multi-Categoría
**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Estado:** Borrador  
**Documento:** 7 de 8

---

## 1. INTRODUCCIÓN

Este documento define todas las reglas que gobiernan el comportamiento del negocio. Son las decisiones que el sistema debe tomar automáticamente — sin intervención humana — en cada situación posible. Cualquier lógica condicional en el código debe estar respaldada por una regla documentada aquí.

---

## 2. REGLAS DE REGISTRO Y SESIÓN

### RN-001 — Registro opcional
```
El usuario puede comprar sin registrarse (modo invitado).
El registro solo se solicita como opción, nunca como obligatorio.
Al finalizar una compra como invitado, se ofrece la opción de crear cuenta
con los datos ya ingresados (sin volver a escribirlos).
```

### RN-002 — Unicidad del email
```
Un email solo puede estar registrado una vez en la tabla users.
Si el usuario intenta registrarse con un email ya existente:
  → Mostrar: "Este email ya tiene una cuenta. ¿Quieres iniciar sesión?"
  → Ofrecer enlace a login, NO mostrar que la cuenta existe por seguridad
```

### RN-003 — Contraseñas
```
Mínimo: 8 caracteres
Debe contener: al menos 1 letra y 1 número
Almacenamiento: bcrypt con 12 rounds — NUNCA en texto plano
Recuperación: enlace de recuperación enviado al email (expira en 1 hora)
```

### RN-004 — Sesión de usuario
```
Duración del token JWT: 7 días (renovable con actividad)
Si el token expira: redirigir al login sin borrar el carrito
El carrito se conserva entre sesiones (localStorage)
Al hacer login, el carrito de invitado se fusiona con el carrito guardado
```

### RN-005 — Sesión del administrador
```
Duración del token JWT admin: 8 horas (no renovable automáticamente)
Si expira: redirigir al login del panel /admin/login
Máximo 3 intentos fallidos de login → bloqueo de 15 minutos por IP
```

---

## 3. REGLAS DE PRODUCTOS

### RN-006 — Fuente de productos
```
Los productos se obtienen en tiempo real desde Dropi API.
El backend consulta Dropi y transforma la respuesta al formato interno.
En v1 NO hay caché de productos — cada request consulta Dropi.
En v2 se implementará caché con TTL de 30 minutos.
```

### RN-007 — Disponibilidad de stock
```
Si inStock = true  → Botón "Agregar al carrito" activo
Si inStock = false → Botón deshabilitado + mensaje "Agotado"
                   → Mostrar botón "Avisarme cuando esté disponible" (abre WhatsApp)
Si el producto se agota DESPUÉS de estar en el carrito:
  → El ítem permanece en el carrito
  → Al intentar hacer checkout: mostrar error "El producto [nombre] se agotó.
    Por favor retíralo del carrito para continuar."
```

### RN-008 — Precios
```
Los precios siempre se muestran en COP (pesos colombianos).
El precio se congela al momento de agregar al carrito.
Si el precio cambia en Dropi mientras el producto está en el carrito:
  → El carrito mantiene el precio original
  → Al hacer checkout: el backend verifica el precio actual en Dropi
  → Si hay diferencia > 5%: notificar al usuario antes de confirmar
El precio NUNCA incluye decimales (siempre entero).
```

### RN-009 — Imágenes de productos
```
Siempre mostrar al menos 1 imagen.
Si no hay imagen disponible: mostrar placeholder con el logo de Novainvesa.
La imagen principal es siempre images[0].
Las imágenes se cargan con lazy loading excepto la imagen principal
del producto en la página de detalle.
```

---

## 4. REGLAS DEL CARRITO

### RN-010 — Límites del carrito
```
Máximo 20 productos distintos en el carrito.
Máximo 10 unidades por producto.
Si se intenta agregar más: mostrar "Cantidad máxima alcanzada para este producto"
Mínimo 1 unidad por producto (no se puede poner 0 — eliminar en su lugar).
```

### RN-011 — Persistencia del carrito
```
El carrito se guarda en localStorage con la clave "novainvesa_cart".
Persiste entre sesiones y recargas del navegador.
Expiración: 7 días desde la última modificación.
Al expirar: vaciar el carrito silenciosamente al próximo inicio.
Si el usuario está logueado (v2): sincronizar carrito con la BD.
```

### RN-012 — Carrito vacío en checkout
```
Si el usuario intenta acceder a /checkout con el carrito vacío:
  → Redirigir automáticamente al Home
  → Mostrar mensaje: "Tu carrito está vacío. Agrega productos para continuar."
```

### RN-013 — Cálculo del total
```
Subtotal = SUMA(unitPrice × quantity) para todos los ítems
Costo de envío = $0 en v1 (incluido en el precio del producto vía Dropi)
Total = Subtotal
El total se recalcula en tiempo real ante cualquier cambio en el carrito.
```

---

## 5. REGLAS DE CHECKOUT

### RN-014 — Validación del formulario
```
El botón "Confirmar pedido" permanece DESHABILITADO hasta que:
  ✓ Todos los campos obligatorios estén completos
  ✓ El email tenga formato válido
  ✓ El teléfono tenga mínimo 10 dígitos
  ✓ La dirección tenga mínimo 10 caracteres
  ✓ Un método de pago esté seleccionado
  ✓ Si es COD: la cobertura esté verificada y disponible

Al intentar enviar con errores:
  → Resaltar todos los campos inválidos en rojo
  → Hacer scroll automático al primer campo con error
```

### RN-015 — Código de pedido
```
Formato: "NOVA-YYYYMMDD-NNNN"
Ejemplo: "NOVA-20260329-0001"
El número secuencial se reinicia cada día.
Se genera en el backend — nunca en el frontend.
Es único e irrepetible (UNIQUE en la BD).
```

### RN-016 — Datos del cliente en el pedido
```
Los datos personales y la dirección se COPIAN al crear el pedido.
Esto garantiza que si el usuario modifica sus datos después,
el pedido original no se altera (integridad histórica).
```

### RN-017 — Prevención de pedidos duplicados
```
Si el backend detecta un pedido con el mismo wompi_transaction_id
o mp_payment_id ya existente:
  → NO crear un nuevo pedido
  → Retornar el pedido existente con status 200
  → Registrar el intento en logs
Esto previene pedidos dobles por doble-clic o reenvío del webhook.
```

---

## 6. REGLAS DE PAGO

### RN-018 — Método COD (Contra Entrega)
```
El COD solo se muestra si:
  1. La ciudad del cliente tiene cobertura en Dropi
  2. El total del pedido es menor a $500.000 COP (límite de Dropi)

Si la ciudad NO tiene cobertura:
  → Ocultar la opción COD del selector de pago
  → Mostrar mensaje: "El pago contra entrega no está disponible
    para tu ciudad. Puedes pagar con Wompi o MercadoPago."

Si el total supera $500.000 COP:
  → Ocultar COD con mensaje: "Pago contra entrega disponible para
    pedidos menores a $500.000"
```

### RN-019 — Timeout de pago
```
La sesión de pago en Wompi y MercadoPago expira en 30 minutos.
Si el usuario demora más:
  → La pasarela muestra error de sesión expirada
  → El frontend redirige a /checkout con mensaje:
    "Tu sesión de pago expiró. Por favor intenta de nuevo."
  → El carrito se conserva intacto
```

### RN-020 — Pago rechazado
```
Si la pasarela rechaza el pago:
  → NO crear pedido en Dropi
  → Mostrar mensaje específico según el código de error de la pasarela:
      PAYMENT_REJECTED → "Tu pago fue rechazado. Verifica los datos
                          o intenta con otro método."
      INSUFFICIENT_FUNDS → "Fondos insuficientes. Intenta con otro
                            método de pago."
      TIMEOUT → "El pago expiró. Por favor intenta de nuevo."
  → Permitir reintentar sin salir del checkout
  → El carrito se conserva intacto
```

### RN-021 — Verificación de webhooks
```
TODOS los webhooks de pago deben verificarse criptográficamente:
  Wompi:       HMAC-SHA256 con WOMPI_EVENTS_SECRET
  MercadoPago: Firma en header x-signature con MP_WEBHOOK_SECRET

Si la firma no coincide:
  → Rechazar el webhook con HTTP 401
  → Registrar el intento en logs con la IP de origen
  → NO crear ningún pedido
```

### RN-022 — Orden de creación en Dropi
```
El pedido se crea en Dropi SOLO cuando:
  → Pago online: webhook recibido y verificado con status APPROVED
  → COD: inmediatamente al confirmar el formulario (sin pago previo)

NUNCA crear el pedido en Dropi antes de confirmar el pago online.
Si falla la creación en Dropi después de un pago aprobado:
  → Registrar el error con alta prioridad en logs
  → Enviar email de alerta al operador
  → El pedido queda en status CONFIRMED (sin dropi_order_id)
  → Operador debe crear el pedido manualmente en Dropi
```

---

## 7. REGLAS DE ENVÍO Y ENTREGA

### RN-023 — Tiempo de entrega estimado
```
Ciudades principales (Bogotá, Medellín, Cali, Barranquilla): 2-4 días hábiles
Otras ciudades Colombia: 4-7 días hábiles
Ciudades fuera de Colombia (LATAM): según cobertura de Dropi en ese país

El tiempo estimado se muestra:
  → En la página de producto
  → En el resumen del checkout
  → En el email de confirmación
  → En la página de confirmación
```

### RN-024 — Número de guía
```
El número de guía (tracking_number) lo asigna Dropi cuando el pedido
pasa a estado SHIPPED.
Mientras el pedido esté en CREATED, CONFIRMED o PREPARING:
  → Mostrar: "Número de guía pendiente — disponible cuando tu pedido sea enviado"
Cuando se reciba el número de guía desde Dropi:
  → Actualizar la tabla orders (tracking_number + carrier)
  → (v2) Enviar notificación WhatsApp automática al cliente
```

### RN-025 — Pedido no entregado
```
Si Dropi marca el pedido como FAILED (no entregado):
  → El operador debe contactar al cliente por WhatsApp
  → Opciones: reprogramar entrega o cancelar y procesar devolución
  → En COD: Dropi retiene el paquete hasta nueva instrucción
  → En pago online: iniciar proceso de devolución si el cliente lo solicita
```

---

## 8. REGLAS DE USUARIOS REGISTRADOS

### RN-026 — Direcciones guardadas
```
Máximo 5 direcciones por usuario.
Solo puede haber 1 dirección marcada como default (is_default = true).
Al marcar una nueva como default: desmarcar automáticamente la anterior.
Al eliminar la dirección default: marcar la más reciente como nueva default.
```

### RN-027 — Historial de pedidos
```
Un usuario registrado puede ver todos sus pedidos en "Mi cuenta".
Los pedidos hechos como invitado con el mismo email NO se asocian
automáticamente al crear la cuenta (privacidad).
El usuario puede consultar pedidos invitados por código de pedido + email.
```

### RN-028 — Wishlist
```
Máximo 50 productos en la wishlist por usuario.
Si se supera el límite: mostrar "Alcanzaste el límite de 50 favoritos.
Elimina alguno para agregar nuevos."
Comportamiento de toggle:
  → Si el producto NO está en wishlist: agregarlo
  → Si el producto YA está en wishlist: eliminarlo
  → Confirmación visual inmediata (cambio de ícono corazón)
```

### RN-029 — Método de pago preferido
```
Al completar una compra, ofrecer guardar el método de pago usado como preferido.
Al entrar al checkout, preseleccionar el método preferido guardado.
El usuario puede cambiar su método preferido desde "Mi cuenta".
NUNCA guardar datos de tarjeta — solo el nombre del método.
```

---

## 9. REGLAS DE MÉTRICAS Y ESTADÍSTICAS

### RN-030 — Actualización de product_stats
```
view_count:     +1 por cada PageView único del producto (throttle: 1 por sesión)
cart_add_count: +1 cada vez que se agrega al carrito (sin throttle)
wishlist_count: +1 al agregar, -1 al quitar de la wishlist
units_sold:     +quantity cuando el pedido pasa a CONFIRMED
orders_count:   +1 cuando el pedido pasa a CONFIRMED
total_revenue:  +subtotal_del_producto cuando el pedido pasa a CONFIRMED
search_count:   +1 cada vez que el producto aparece en resultados de búsqueda

Si el producto no existe en product_stats al momento de actualizar:
  → Crear la fila con INSERT ... ON DUPLICATE KEY UPDATE
```

### RN-031 — Registro de búsquedas
```
Registrar en product_searches cuando:
  → El usuario envía una búsqueda (al presionar Enter o clic en buscar)
  → Mínimo 2 caracteres para registrar
  → Guardar el user_id si está logueado, NULL si es invitado
  → Guardar el número de resultados devueltos

NO registrar:
  → Búsquedas automáticas mientras el usuario escribe (typeahead)
  → Búsquedas de 1 solo carácter
```

---

## 10. REGLAS DE EMAILS TRANSACCIONALES

### RN-032 — Email de confirmación de pedido
```
Se envía automáticamente cuando:
  → Pago online: webhook de pasarela recibido con status APPROVED
  → COD: pedido creado exitosamente en Dropi

Remitente: pedidos@novainvesa.com
Asunto: "✅ Pedido confirmado #NOVA-YYYYMMDD-NNNN"
Contenido:
  - Nombre del cliente
  - Código del pedido
  - Lista de productos con imágenes, cantidades y precios
  - Total del pedido
  - Dirección de entrega
  - Método de pago
  - Tiempo estimado de entrega
  - Botón "Consultar estado por WhatsApp"
  - Logo y datos de contacto de Novainvesa
```

### RN-033 — Reintentos de email
```
Si falla el envío del email:
  → Reintentar hasta 3 veces con espera de 5 minutos entre intentos
  → Si los 3 intentos fallan: registrar en logs para revisión manual
  → El pedido NO se cancela por un fallo de email
```

---

## 11. REGLAS DEL PANEL DE ADMINISTRACIÓN

### RN-034 — Acceso al panel
```
URL: https://www.novainvesa.com/admin
Acceso exclusivo para usuarios en la tabla admin_users con is_active = true.
Si se accede a cualquier ruta de /admin sin sesión válida:
  → Redirigir a /admin/login
Después de login exitoso:
  → Redirigir a /admin/dashboard
  → Registrar last_login_at en admin_users
```

### RN-035 — Cambio de estado de pedido desde el panel
```
El administrador puede cambiar el estado de un pedido manualmente.
Transiciones permitidas desde el panel:
  CREATED    → CANCELLED
  CONFIRMED  → CANCELLED
  DELIVERED  → (sin cambios disponibles — estado final)
  RETURNED   → (sin cambios disponibles — estado final)

Al cambiar el estado:
  → Registrar el cambio con timestamp en updated_at
  → (v2) Notificar al cliente por WhatsApp automáticamente
```

### RN-036 — Datos visibles en el panel
```
El panel muestra TODOS los pedidos (usuarios registrados e invitados).
El panel muestra TODOS los usuarios registrados.
El panel NO muestra contraseñas ni datos bancarios.
Las métricas del dashboard se calculan en tiempo real desde la BD.
```

---

## 12. REGLAS DE SEGURIDAD

### RN-037 — Protección de datos personales
```
Nunca exponer en el frontend:
  → password_hash
  → Tokens completos de pasarelas de pago
  → Claves API del backend
  → Datos de otros usuarios

Los endpoints que devuelven datos de usuario deben verificar
que el user_id del token coincida con el recurso solicitado.
```

### RN-038 — Rate limiting
```
Endpoints públicos:      200 requests / 15 minutos / IP
Endpoints autenticados:  60 requests / 15 minutos / IP
Crear pedido:            10 requests / hora / IP
Login de usuario:        5 intentos / 15 minutos / IP → bloqueo temporal
Login de admin:          3 intentos / 15 minutos / IP → bloqueo temporal
```

### RN-039 — CORS
```
Solo se aceptan requests al backend desde:
  → https://www.novainvesa.com (producción)
  → http://localhost:5173 (desarrollo frontend)
Cualquier otro origen recibe HTTP 403.
```

---

## 13. REGLAS DE INTERNACIONALIZACIÓN

### RN-040 — Idioma por defecto
```
Idioma por defecto: español (es)
El idioma se detecta en este orden:
  1. Valor guardado en localStorage ("novainvesa_lang")
  2. Idioma del navegador del usuario
  3. Español como fallback

El cambio de idioma es inmediato y no requiere recargar la página.
El idioma seleccionado persiste en localStorage sin expiración.
```

### RN-041 — Moneda y precios con idioma
```
Los precios SIEMPRE se muestran en COP independiente del idioma.
El formato del precio cambia según el idioma:
  Español:    $89.900      (punto como separador de miles)
  Inglés:     COP 89,900   (coma como separador de miles)
  Portugués:  R$ 89.900    (punto como separador — nota: no es BRL real)
```

---

## 14. REGLAS DE INTEGRACIÓN CON DROPI

### RN-042 — Creación de pedido en Dropi
```
Al crear el pedido en Dropi se envían:
  → Datos del cliente (nombre, teléfono, email)
  → Dirección de entrega completa
  → Producto (dropi_product_id + quantity)
  → Método de pago (online o COD)

Si la API de Dropi devuelve error:
  → HTTP 5xx: reintentar hasta 3 veces con espera exponencial (1s, 2s, 4s)
  → HTTP 4xx: no reintentar — registrar error y alertar al operador
  → Timeout (>10s): registrar como error y alertar al operador
```

### RN-043 — Sincronización de estados desde Dropi
```
En v1: el operador actualiza el estado del pedido manualmente en el panel
       basándose en lo que ve en el dashboard de Dropi.

En v2: webhook de Dropi → backend actualiza estado automáticamente
       y notifica al cliente por WhatsApp.
```

---

## 15. MATRIZ DE DECISIONES — MÉTODO DE PAGO

Resumen visual de cuándo se muestra cada método:

```
┌─────────────────────────────────────────────────────────┐
│            ¿Qué métodos de pago se muestran?            │
├──────────────────┬──────────────────┬───────────────────┤
│   WOMPI          │   MERCADOPAGO    │   COD             │
├──────────────────┼──────────────────┼───────────────────┤
│ Siempre visible  │ Siempre visible  │ Solo si:          │
│                  │                  │ ✓ Ciudad con      │
│                  │                  │   cobertura Dropi │
│                  │                  │ ✓ Total < $500k   │
└──────────────────┴──────────────────┴───────────────────┘

Escenarios:
A) Ciudad con cobertura + total < $500k  → Wompi + MP + COD
B) Ciudad con cobertura + total ≥ $500k  → Wompi + MP
C) Ciudad sin cobertura                  → Wompi + MP
D) LATAM (fuera de Colombia)             → Wompi + MP (COD no disponible)
```

---

## 16. RESUMEN DE REGLAS POR MÓDULO

| Módulo | Reglas | Críticas |
|---|---|---|
| Registro y sesión | RN-001 a RN-005 | RN-003, RN-004 |
| Productos | RN-006 a RN-009 | RN-007, RN-008 |
| Carrito | RN-010 a RN-013 | RN-011, RN-012 |
| Checkout | RN-014 a RN-017 | RN-015, RN-017 |
| Pagos | RN-018 a RN-022 | RN-021, RN-022 |
| Envío y entrega | RN-023 a RN-025 | RN-022 |
| Usuarios registrados | RN-026 a RN-029 | RN-029 |
| Métricas | RN-030 a RN-031 | RN-030 |
| Emails | RN-032 a RN-033 | RN-032 |
| Panel admin | RN-034 a RN-036 | RN-034 |
| Seguridad | RN-037 a RN-039 | RN-037, RN-038 |
| i18n | RN-040 a RN-041 | RN-040 |
| Dropi | RN-042 a RN-043 | RN-042 |

**Total: 43 reglas de negocio documentadas.**

---

*Documento vivo — versión 1.0*  
*Documento anterior: Design System (6 de 8) | Próximo: Plan Meta Ads + Chatea Pro (8 de 8)*
