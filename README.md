# Blanidas Frontend

A web application for managing medical equipment repairs. It allows engineers to create and track repair requests, and managers to manage equipment, spare parts, institutions, and view statistics.


## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Language | TypeScript |
| Build tool | Vite 7 |
| Routing | TanStack Router (file-based routing) |
| Server state | TanStack Query |
| Styling | Tailwind CSS 4 |
| UI components | Radix UI + shadcn/ui (New York) |
| Charts | Recharts |
| Icons | Lucide React |

## Architecture

The project follows **Clean Architecture** principles with three layers:

```
src/
├── domain/          # Business logic (framework-agnostic)
├── infrastructure/  # External dependencies (API, mappers, DTOs)
└── presentation/    # UI (pages, components, hooks, routes)
```

### Domain

Contains entities, repositories (interfaces), use cases, and query objects for data filtering.

- **entities** — domain models (`Equipment`, `RepairRequest`, `SparePart`, `Institution`, etc.)
- **repositories** — contracts for data access
- **useCases** — business operations (`auth`, `equipment`, `repair-request`, `statistics`, etc.)
- **queries** — query objects for paginated and filtered lists
- **auth** — session, tokens, roles

### Infrastructure

Implementation of external dependencies:

- **api** — HTTP clients for each entity
- **dto** — backend response types
- **mappers** — DTO - domain entity transformations
- **query** — mapping query objects to URL parameters
- **services** — `AuthService`, `QrCodeService`
- **fetch.ts** — HTTP client with automatic JWT token refresh

Dependency wiring is done in `dependencies.ts`.

### Presentation

- **routes** — TanStack Router file-based routes
- **pages** — application pages
- **components** — UI components (`ui/`, `layouts/`, `tabs/`)
- **hooks** — React hooks for working with entities and UI logic

## Project Structure

```
blanidas_frontend/
├── public/                          # Static files
├── src/
│   ├── domain/
│   │   ├── auth/                    # Authentication, roles, session
│   │   ├── entities/                # Domain entities
│   │   ├── models/                  # Auxiliary models
│   │   ├── queries/                 # Query objects for lists
│   │   ├── repositories/            # Repository interfaces
│   │   └── useCases/                # Use cases
│   ├── infrastructure/
│   │   ├── api/                     # API clients
│   │   ├── dto/                     # Data Transfer Objects
│   │   ├── mappers/                 # DTO → Entity mappers
│   │   ├── query/                   # Query → URL mappers
│   │   ├── query-builders/          # Query builders
│   │   └── services/                # Services (auth, QR codes)
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── layouts/             # Layouts (BaseLayout, Table, Pagination)
│   │   │   ├── tabs/                # Tabs for each module
│   │   │   └── ui/                  # shadcn/ui components
│   │   ├── hooks/                   # React hooks
│   │   ├── pages/                   # Pages
│   │   └── routes/                  # TanStack Router routes
│   ├── lib/                         # Utilities
│   ├── App.tsx                      # Root component + router
│   ├── context.tsx                  # Auth context provider
│   ├── dependencies.ts              # Dependency injection
│   ├── options.ts                   # URL configuration
│   └── main.tsx                     # Entry point
├── components.json                  # shadcn/ui configuration
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Routes

| Path | Description | Access |
|------|-------------|--------|
| `/accounts/login` | Login page | Public |
| `/repair-request/:equipmentId` | Create repair request (via QR code) | Public |
| `/dashboard/repair-requests` | Repair requests list | Authenticated |
| `/dashboard/repair-requests/:id` | Request details | Authenticated |
| `/dashboard/spare-parts` | Spare parts (engineer) | Authenticated |
| `/dashboard/manager/equipment` | Equipment management | Manager, Admin |
| `/dashboard/manager/spare-parts` | Spare parts management | Manager, Admin |
| `/dashboard/manager/statistics` | Statistics and analytics | Manager, Admin |
| `/dashboard/manager/settings` | Settings (institutions, categories, staff list) | Manager, Admin |

## User Roles

| Role | Capabilities |
|------|--------------|
| **engineer** | View and create repair requests, work with spare parts |
| **manager** | Everything an engineer can do + equipment management, spare parts, statistics, settings (view staff list) |
| **admin** | Same as manager + create and edit users |

## Getting Started

### Requirements

- Node.js 18+
- npm
- Running Blanidas API backend

### Installation

```bash
npm install
```

### Configuration

Edit `src/options.ts` — set the backend and client URLs:

```typescript
const BaseServerURL = "http://localhost:8000";
const BaseClientURL = "http://localhost:5173";
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production build

```bash
npm run build
```

Built files will appear in the `dist/` folder.

### Preview production build

```bash
npm run preview
```

## Configuration

| File | Purpose |
|------|---------|
| `src/options.ts` | Backend (`BaseServerURL`) and client (`BaseClientURL`) URLs |
| `vite.config.ts` | Vite config, `@` - `src/` alias, TanStack Router plugin |
| `components.json` | shadcn/ui settings |
| `tsconfig.json` | TypeScript settings |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Core Modules

- **Repair requests** — creation (including via QR code), viewing, status updates, history, failure types
- **Equipment** — catalog of medical equipment with models, categories, and manufacturers
- **Spare parts** — spare parts inventory with locations and categories
- **Institutions** — management of medical institutions
- **Staff** — view system users (manager); create and edit users (admin only)
- **Statistics** — charts and data export (failure types, repair time, trends)
