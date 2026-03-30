# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Novainvesa** — Multi-category dropshipping e-commerce store targeting Colombia and LATAM. Monorepo with separate `Frontend/` and `Backend/` directories.

- **Frontend:** Deployed on Hostinger (static)
- **Backend:** Deployed on Render.com (Node.js)
- **Database:** Hostinger MySQL (`u228070604_novainvesa_db`)
- **Domain:** www.novainvesa.com

## Commands

### Frontend (`cd Frontend`)
```bash
npm run dev       # Dev server on http://localhost:5173
npm run build     # Production build to dist/
npm run lint      # ESLint check
npm run preview   # Serve dist/ locally
```

### Backend (`cd Backend`)
```bash
npm run dev       # nodemon (auto-reload) on http://localhost:3000
npm start         # node index.js (production)
```

No test commands are configured yet.

## Architecture

### Frontend — React 19 + Vite 8 + Tailwind 4
- **Entry:** `main.jsx` → `App.jsx` (React Router routes)
- **State:** Context API — `CartContext` (localStorage-persisted, 7-day TTL)
- **HTTP:** Axios client in `services/api.js` reading `VITE_API_URL` env var
- **i18n:** i18next with ES/EN/PT locales in `locales/`
- **Config:** Site-wide settings in `src/config/site.js`; 5 fixed categories in `src/config/categories.js`

Most component and service files are **skeleton stubs** awaiting implementation.

### Backend — Node.js + Express 5
- **Entry:** `index.js` — Express app with Helmet, CORS, rate-limiting (200/15 min), body parser, then 12 route modules at `/api/v1/`
- **Database:** `src/config/database.js` — `mysql2/promise` connection pool (10 connections), Colombia timezone `-05:00`. Raw SQL queries — **no ORM**.
- **Only implemented route:** `GET /api/health`
- All controllers, services, and middlewares are empty skeleton files.

### API Contract
All REST endpoints use `/api/v1/` prefix. Standard response envelope:
```json
{ "success": true, "data": {...} }         // success
{ "success": false, "error": { "code": "...", "message": "..." } }  // error
```
Full contract is documented in `Docs/04-API-contract.md`.

### External Integrations (pending implementation)
| Service | Purpose |
|---|---|
| Dropi API | Product catalog + order fulfillment |
| Wompi | PSE, Nequi, card payments |
| MercadoPago | Daviplata, card payments |
| Meta Pixel / CAPI | Conversion tracking |
| Chatea Pro | WhatsApp bot |
| Hostinger SMTP | Transactional email (`pedidos@novainvesa.com`) |

## Key Business Rules
- **Currency:** COP (Colombian Pesos), no decimals. Use `formatPrice()` in `Frontend/src/utils/formatters.js`.
- **COD eligibility:** Only if Dropi covers the city AND order total < $500,000 COP.
- **Order ID format:** `NOVA-YYYYMMDD-NNNN`
- **Dropi order creation:** Only after payment confirmation (never before).
- **Password hashing:** bcrypt with 12 rounds.
- **Admin routes:** Protected by `admin_users` table; separate JWT secret from user JWT.
- **Categories:** Exactly 5 — `mascotas`, `hogar`, `tecnologia`, `belleza`, `fitness`.

## Documentation
Detailed specs live in `Docs/`:
- `01-PRD.md` — Product requirements
- `02-arquitectura-tecnica.md` — Technical architecture
- `03-flujos-usuario.md` — User flows
- `04-API-contract.md` — REST endpoint specs
- `05-modelo-datos.md` — Database schema
- `06-design-system.md` — Colors, typography, components
- `07-reglas-negocio.md` — Business logic rules

## Git Conventions
Branch model: `main` (production, protected) → `dev` → `feat/name` / `fix/name`

Commit messages in **Spanish**, imperative, lowercase, max 72 chars:
```
feat: agregar página de categorías
fix: corregir validación del checkout
docs: actualizar modelo de datos
```
Valid types: `docs`, `feat`, `fix`, `style`, `chore`, `refactor`, `test`, `config`
