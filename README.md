# Trendora

Trendora is a scalable multi-vendor e-commerce database system built with PostgreSQL. The project focuses on designing a secure, optimized, and normalized database architecture capable of supporting real-world e-commerce operations such as inventory management, orders, payments, promotions, and customer interactions.

This project was developed as coursework for Database Design and Optimization under the supervision of Engr Kinge Patrick.

---

# Project Goals

- Design a scalable and normalized e-commerce database
- Ensure data integrity and transaction consistency
- Optimize query performance using indexes and relational design
- Implement secure database structures and access control
- Simulate real-world e-commerce workflows

---

# Technologies Used

## Database
- PostgreSQL
- SQL
- pgcrypto
- uuid-ossp

## Backend
- Node.js
- Express.js
- jsonwebtoken
- helmet
- express-rate-limit

## Frontend
- HTML
- CSS (Vanilla, Custom UI Theme)
- JavaScript

---

# Core Features

- Multi-vendor system
- Product categories and variants
- Shopping cart and order management
- Inventory tracking
- Coupon and promotion system
- Mobile money payment support (MTN MoMo & Orange Money billing flows)
- Role-based admin permissions
- UUID-based relational schema
- PWA Integration with offline asset support
- Security (JWT sessions, Helmet protection, rate limiting, and database RLS)

---

# Folder Structure

```text
Trendora/
├── README.md
├── database/
│   ├── schema.sql       (DB tables/seed/indexes)
│   ├── auditing.sql     (Audit triggers/logs)
│   ├── caching.sql      (Materialized views)
│   └── security.sql     (RLS policies & Roles)
├── backend/
│   ├── package.json     (Security dependencies)
│   ├── server.js        (Secure Express server)
│   ├── middleware.js    (JWT, validations, limits)
│   └── db.js            (Postgres pool)
└── frontend/
    ├── index.html       (Unified Login/Register page)
    ├── style.css        (Premium CSS variables & tokens)
    ├── api.js           (Fetch agent + auto JWT header)
    ├── sw.js            (PWA Service Worker offline caching)
    ├── manifest.json    (PWA manifest app specs)
    └── pages/           (Dynamic subviews)
        ├── home.html
        ├── products.html
        ├── cart.html
        └── orders.html
```

---

# Database Setup

## PostgreSQL Installation

Download PostgreSQL:

https://www.postgresql.org/download/

During installation:
- Keep the default port `5432`
- Remember your PostgreSQL password
- Install pgAdmin if prompted

---

# Setup Using pgAdmin (GUI)

## 1. Create Database

Open pgAdmin and create a database named:

```text
trendora
```

---

## 2. Open Query Tool

- Select the `trendora` database
- Navigate to:
  
```text
Tools → Query Tool
```

---

## 3. Run the Schema

Open the file:

```text
database/schema.sql
```

Copy and execute the script inside the Query Tool.

---

## 4. Verify Tables

Expand:

```text
trendora
└── Schemas
    └── public
        └── Tables
```

---

# Setup Using Terminal (CLI)

## Login to PostgreSQL

```bash
psql -U postgres
```

---

## Create Database

```sql
CREATE DATABASE trendora;
```

---

## Connect to Database

```sql
\c trendora
```

---

## Run Schema File

```bash
psql -U postgres -d trendora -f database/schema.sql
```

## Add Demo Data

After the schema is created, load the demo products and test customer:

```bash
psql -U postgres -d trendora -f database/seed.sql
```

Demo login:

```text
Email: demo@trendora.test
Password: password123
```

---

## Verify Tables

```sql
\dt
```

---

# Backend Setup

Move into the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Server runs on:

```text
http://localhost:3000
```

---

# Current Status

| Component | Status | Description |
|---|---|---|
| Database Schema | Completed | PostgreSQL relational schema with audits, caching views, and RLS policies. |
| Backend API | Completed | Secure REST API with JWT Auth, Helmet headers, rate limiters, and MoMo checkout flows. |
| Frontend UI | Completed | Premium PWA UI matching Figma screen specs, responsive details, MoMo billing. |

---

# System Architecture & Key Mechanisms

## Permission-Based Access Control (PBAC)

Instead of traditional Role-Based Access Control (RBAC), Trendora utilizes a more granular **Permission-Based Access Control (PBAC)** model.

- **Implementation**: Instead of assigning a blanket role (e.g., "Manager"), administrators are granted specific permissions via the `admin_permissions` junction table linking `admin_id` to `permission_id`.
- **Why PBAC?**: It prevents privilege escalation and ensures the principle of least privilege. If a support staff only needs to process refunds, they receive `can_refund_orders` without gaining access to the entire order management suite.
- **Database Enforcement**: Row-level security and backend middleware strictly verify these specific tokens rather than a user's role.

## Coupon and Voucher System

Trendora includes a robust promotion engine:
- Coupons are configured in the `coupons` table with constraints such as `discount_type` (`PERCENTAGE` or `FIXED`), `min_purchase_amount`, `valid_until`, and `max_uses`.
- When users enter a code, the backend automatically validates conditions and locks the usage limit row.
- **Demo Codes to Try**:
  - `WELCOME10`: 10% off your purchase.
  - `FASHION500`: Flat 500 FCFA discount for cart totals exceeding 10,000 FCFA.

## Concurrency and Row-Level Blocking

To prevent race conditions during high-traffic checkout flows or simultaneous refund requests, the database utilizes **Row-Level Blocking**:
- Transactions use `SELECT ... FOR UPDATE` when calculating final payouts or modifying inventory.
- This effectively locks the row, ensuring two concurrent requests cannot over-refund an order or sell an item that just went out of stock.

---

# Team Members

| Name | Matricule |
|---|---|
| ESINGILA LAUREL LUMIERE | FE24A267 |
| MATUTE RANSOM | FE24A307 |
| ATEMKENG PRINCE LOVET TANZE | FE24A230 |
| NGORAN FLORENCE | FE24A338 |
| MBUH DORA FONGWI | FE24A313 |
| MANAKWA BLESSING | FE24A304 |
| DIONI SHAMMAH | FE24A248 |
| MASUMBE SAKWE MASUMBE JR | FE24A306 |
| TREVOR EFEME MOKABOE | FE24A381 |
| TAMOKOUE FOGUE LANDRY | FE24A625 |
| GRAI NGONG DOUORE RUDOLF | FE24A287 |
| BEBONGCHU BLAISE | FE24A239 |
| MEH SIMON HONORE TANCHA | FE24A316 |

---

# References

- PostgreSQL Documentation  
  https://www.postgresql.org/docs/

- Express.js Documentation  
  https://expressjs.com/

- Node.js Documentation  
  https://nodejs.org/en/docs

---

# License

This project was developed for academic and educational purposes.
