# MyStore Monorepo

Modern full-stack e-commerce monorepo built with **NestJS**, **Next.js 16 (App Router)**, **Prisma ORM**, and **Turborepo**.

---

## 🏗️ Architecture & Structure

```
my-store/
├── apps/
│   ├── api/                 # NestJS Backend (REST API, Swagger, Prisma ORM, Auth, Cart, Orders)
│   └── web/                 # Next.js 16 Frontend (App Router, React 19, Tailwind CSS v4, shadcn/ui)
├── packages/
│   └── types/               # Shared domain TypeScript interfaces & contracts
├── package.json             # Root npm workspace configuration & Turbo scripts
├── turbo.json               # Turborepo task pipeline configuration
└── .gitignore               # Monorepo-wide gitignore rules
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Both Apps in Development
```bash
npm run dev
```
Turborepo will concurrently start both services:
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **Swagger Documentation**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Frontend Web**: [http://localhost:3001](http://localhost:3001)

### 3. Run Individual Apps
```bash
# Run API only (NestJS with watch mode)
npm run dev:api

# Run Frontend only (Next.js 16 dev server)
npm run dev:web
```

---

## 🛠️ Build & Test

```bash
# Build all apps & packages concurrently using Turbo cache
npm run build

# Run linter across all packages
npm run lint

# Format code with Prettier
npm run format
```

---

## 📦 Apps & Packages

| Workspace | Description | Technology | Port |
| :--- | :--- | :--- | :--- |
| **`@my-store/web`** | Frontend Storefront | Next.js 16, React 19, Tailwind CSS v4, Lucide, shadcn/ui | `3001` |
| **`@my-store/api`** | Backend REST API | NestJS 12, Prisma ORM 7, PostgreSQL, Swagger, JWT | `3000` |
| **`@my-store/types`** | Shared Contracts | TypeScript models (`Product`, `Order`, `User`, `Cart`, etc.) | N/A |

---

## 🌍 Internationalization (fa / en)

The web app is bilingual: **Persian (`fa`, default & main)** and **English (`en`)**.

| Locale | URLs  | Direction | Font |
| :--- | :--- | :--- | :--- |
| `fa` | `/fa/...` | `rtl` | Vazirmatn |
| `en` | `/en/...` | `ltr` | Geist |

- **Routing** — every page lives under `apps/web/src/app/[lang]/`. `apps/web/src/proxy.ts` redirects locale-less URLs (`/`, `/products`) to the right prefix: `<NEXT_LOCALE cookie>` if set, otherwise the default `fa`.
- **Dictionaries** — all UI strings live in `apps/web/src/lib/i18n/dictionaries.ts` (typed `Dictionary` shape). Server components get the locale via `serverLocale()` (`next/root-params`); client components use `useI18n()` from `components/providers/locale-provider`.
- **Switching** — the navbar language switcher navigates to the same page under the other prefix and stores the choice in the `NEXT_LOCALE` cookie (1 year).
- **Numbers & dates** are formatted with `Intl` (`fa-IR` Persian digits + Jalali calendar); prices stay in USD.
- Adding a locale: add it to `config.ts` + a dictionary in `dictionaries.ts` + `generateStaticParams` in `[lang]/layout.tsx`.
