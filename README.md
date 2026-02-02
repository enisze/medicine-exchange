# MedExchange

Platform for exchanging surplus medicine between hospitals.

## Features

- **Listings**: Hospitals can list surplus medicine for exchange
- **Requests**: Other hospitals can request available medicine
- **Inventory Tracking**: Automatic quantity management with reservations
- **Status Flow**: Draft → Active → Sold/Expired

## Tech Stack

- **Framework**: Next.js 16 + React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: better-auth
- **Server Actions**: next-safe-action
- **URL State**: nuqs

## Prerequisites

- [Bun](https://bun.sh/) (or Node.js 20+)
- [Docker](https://www.docker.com/) (for PostgreSQL)

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Start the database

```bash
docker compose up -d
```

### 3. Environment variables

The `.env` file is already configured:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/medicine_exchange"
BETTER_AUTH_SECRET="medicine-exchange-secret-key-change-in-production"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

### 4. Run database migrations

```bash
bunx drizzle-kit migrate
```

### 5. Start the development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### As a Seller

1. Register and select "Seller" as your role
2. Go to Dashboard → Create new listing
3. Save listing as draft
4. Publish listing (Status: Active)
5. Approve or reject incoming requests

### As a Buyer

1. Register and select "Buyer" as your role
2. Browse available listings at `/listings`
3. Select a listing
4. Enter quantity and submit request
5. Track request status in your dashboard

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected pages
│   │   ├── dashboard/        # Dashboard overview
│   │   │   ├── listings/     # My listings
│   │   │   └── requests/     # Requests
│   │   └── layout.tsx        # Dashboard layout
│   ├── api/auth/[...all]/    # better-auth API
│   ├── listings/             # Public listings
│   └── page.tsx              # Landing + Auth
├── actions/                  # Server Actions
│   ├── auth.ts
│   ├── listings.ts
│   └── requests.ts
├── components/
│   ├── ui/                   # shadcn components
│   ├── auth/
│   ├── layout/
│   ├── listings/
│   └── requests/
├── db/
│   ├── schema.ts             # Drizzle schema
│   └── index.ts              # DB client
└── lib/
    ├── auth.ts               # better-auth server
    ├── auth-client.ts        # better-auth client
    ├── safe-action.ts        # next-safe-action
    └── utils.ts
```

## Data Model

### User

| Field   | Type               |
| ------- | ------------------ |
| id      | string             |
| email   | string             |
| name    | string             |
| role    | SELLER \| BUYER    |

### Listing

| Field            | Type                               |
| ---------------- | ---------------------------------- |
| id               | string                             |
| userId           | string                             |
| title            | string                             |
| description      | string?                            |
| quantity         | number                             |
| reservedQuantity | number                             |
| unit             | string                             |
| expiryDate       | Date                               |
| status           | DRAFT \| ACTIVE \| SOLD \| EXPIRED |

### Request

| Field     | Type                             |
| --------- | -------------------------------- |
| id        | string                           |
| listingId | string                           |
| buyerId   | string                           |
| quantity  | number                           |
| status    | PENDING \| APPROVED \| REJECTED  |

## Inventory Logic

```
Create request   → reservedQuantity += requestedQuantity
Approve request  → quantity -= requestedQuantity
                   reservedQuantity -= requestedQuantity
Reject request   → reservedQuantity -= requestedQuantity
Listing → SOLD   → when quantity = 0
```

## Scripts

| Command          | Description           |
| ---------------- | --------------------- |
| `bun run dev`    | Development server    |
| `bun run build`  | Production build      |
| `bun run start`  | Production server     |
| `bun run lint`   | Linting               |
| `bun run format` | Formatting            |

## Drizzle Commands

```bash
bunx drizzle-kit generate   # Generate migration
bunx drizzle-kit migrate    # Run migrations
bunx drizzle-kit studio     # Open Drizzle Studio
```

## License

MIT
