# Guía de contribución — Novainvesa

## Convención de commits

Todos los commits deben seguir este formato:

```
tipo: descripción corta en español
```

### Tipos de commit

| Tipo | Cuándo usarlo | Ejemplo |
|---|---|---|
| `docs:` | Cambios en documentación | `docs: actualizar modelo de datos` |
| `feat:` | Nueva funcionalidad | `feat: agregar página de producto` |
| `fix:` | Corrección de bug | `fix: corregir validación del checkout` |
| `style:` | Cambios de estilos/CSS | `style: ajustar colores del navbar` |
| `chore:` | Tareas de mantenimiento | `chore: actualizar dependencias` |
| `refactor:` | Refactorización de código | `refactor: reorganizar servicios del backend` |
| `test:` | Agregar o modificar pruebas | `test: agregar prueba al checkout` |
| `config:` | Cambios de configuración | `config: agregar variables de entorno` |

### Reglas

- Siempre en **español**
- Descripción en **minúsculas**
- Máximo **72 caracteres** en la descripción
- Usar el **infinitivo** del verbo: "agregar", "corregir", "actualizar"
- No terminar con punto

### Ejemplos correctos

```
feat: agregar página de categorías con grid de productos
fix: corregir cálculo del total en el carrito
docs: actualizar flujos de usuario con recuperación de carrito
style: cambiar color primario del botón de checkout
chore: agregar carpetas frontend y backend al repositorio
refactor: separar lógica de pagos en servicios independientes
config: agregar configuración de MySQL en variables de entorno
```

### Ejemplos incorrectos

```
fix: Fixed the bug          ← en inglés
feat: Agregar página.       ← mayúscula + punto final
update stuff                ← sin tipo + descripción vaga
feat: se agrega la nueva página de producto al flujo de checkout de la tienda novainvesa  ← muy largo
```

---

## Ramas

| Rama | Uso |
|---|---|
| `main` | Código estable — solo merge cuando todo funciona |
| `dev` | Desarrollo activo — aquí se trabaja día a día |
| `feat/nombre` | Nueva funcionalidad específica |
| `fix/nombre` | Corrección de bug específico |

### Flujo de trabajo recomendado

```bash
# Crear rama de desarrollo
git checkout -b dev

# Trabajar en una nueva funcionalidad
git checkout -b feat/pagina-producto

# Cuando está lista, hacer merge a dev
git checkout dev
git merge feat/pagina-producto

# Cuando dev está estable, hacer merge a main
git checkout main
git merge dev
git push
```

---

## Estructura del repositorio

```
Novainvesa/
├── docs/        → Documentación del proyecto (8 documentos)
├── frontend/    → Tienda web (React + Vite + Tailwind CSS)
├── backend/     → API REST (Node.js + Express)
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

---

## Stack tecnológico

| Capa | Tecnología | Deploy |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Hostinger |
| Backend | Node.js + Express | Render.com |
| Base de datos | MySQL | Hostinger |
| Proveedor | Dropi API | Externo |
| Pagos | Wompi + MercadoPago + COD | Externo |
| WhatsApp Bot | Chatea Pro | Externo |
| Publicidad | Meta Ads | Externo |
