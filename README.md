# Trendora

Trendora is a scalable multi-vendor e-commerce database system designed and optimized using PostgreSQL. The project focuses on building a secure, normalized, and high-performance database architecture capable of supporting real-world e-commerce operations such as product management, inventory tracking, order processing, payments, promotions, and customer interactions.

This project was developed as coursework for Database Design and Optimization under the supervision of Engr Kinge Patrick.

---

# Project Overview

Trendora is designed to simulate the backend data infrastructure of modern e-commerce platforms such as Amazon and SHEIN.

The project focuses on:

- Database normalization
- Data integrity
- Query optimization
- Scalability
- Transaction consistency
- Role-based access control
- Inventory management
- Mobile money payment integration
- Secure relational database design

The current implementation mainly focuses on the database architecture while backend and frontend development are still in progress.

---

# Objectives

The major objectives of the project are:

- Design a normalized and scalable e-commerce database schema
- Optimize query performance using indexes and efficient relationships
- Implement secure relational constraints and access control
- Support real-time inventory and transactional operations
- Simulate real-world e-commerce workflows

---

# Technologies Used

## Database
- PostgreSQL
- SQL
- pgcrypto extension
- uuid-ossp extension

## Backend
- Node.js
- Express.js

## Frontend
- HTML5
- CSS3
- JavaScript

## Tools
- GitHub
- Visual Studio Code

---

# Core Features

## Customer Management
- Customer registration
- Address management
- Cart management

## Vendor System
- Multi-vendor architecture
- Vendor verification
- Product ownership

## Product Management
- Categories
- Product variants
- Product images
- Inventory tracking

## Shopping System
- Cart items
- Orders
- Order items

## Payment System
- MTN Mobile Money support
- Orange Money support
- Payment status tracking

## Promotions and Discounts
- Coupons
- Product promotions
- Category promotions

## Security Features
- UUID-based primary keys
- Role-based admin permissions
- Relational constraints
- Transaction safety

---

# Database Architecture

The database schema is divided into multiple logical layers:

| Level | Description |
|---|---|
| Level 1 | Independent core tables |
| Level 2 | First-level dependent tables |
| Level 3 | Product and transactional dependencies |
| Level 4 | Junction and operational tables |

---

# Folder Structure

```text
Trendora/
├── README.md
├── database/
│   └── schema.sql
│
└── e-commerce project/
    ├── backend/
    │   ├── package.json
    │   └── server.js
    │
    └── frontend/
        ├── index.html
        ├── scrpt.js
        └── style.css
```

---

# Database Tables

The schema currently includes:

- customer
- vendor
- categories
- product
- product_variants
- product_images
- carts
- cart_items
- orders
- order_items
- payment
- inventory
- coupons
- promotions
- reviews
- admin
- permissions
- admin_permissions
- coupon_usages
- category_promotions
- product_promotions

---

# Key Design Decisions

## UUID Primary Keys

The system uses UUIDs instead of sequential integers for:
- scalability
- security
- distributed system compatibility

## Database Normalization

The schema is normalized to reduce:
- redundancy
- inconsistent data
- unnecessary duplication

## Product Variants

Products support:
- colors
- sizes
- stock quantities
- variant pricing

## Inventory Tracking

Inventory movement is tracked using:
- stock_in
- stock_out

instead of storing only a single quantity value.

## ACID Transactions

The database design follows ACID principles to ensure:
- reliability
- consistency
- transaction safety

---

# How to Set Up the Project

## 1. Clone the Repository

```bash
git clone <repository-url>
```

Move into the project directory:

```bash
cd Trendora
```

---

# PostgreSQL Installation

Download PostgreSQL from the official website:

https://www.postgresql.org/download/

During installation:

- Remember your PostgreSQL password
- Keep the default port as `5432`
- Install pgAdmin if prompted

---

# Database Setup Using pgAdmin (GUI Method)

## Step 1 — Open pgAdmin

Launch pgAdmin after installing PostgreSQL.

---

## Step 2 — Connect to PostgreSQL

- Enter the password you created during installation
- Expand the PostgreSQL server from the left sidebar

---

## Step 3 — Create a New Database

1. Right click on `Databases`
2. Click `Create`
3. Select `Database`

Create a database named:

```text
trendora
```

Click `Save`.

---

## Step 4 — Open Query Tool

1. Select the `trendora` database
2. Click on `Tools`
3. Click `Query Tool`

---

## Step 5 — Import the Schema

1. Open the `schema.sql` file from the `database` folder
2. Copy the contents
3. Paste into the Query Tool
4. Click the Execute button

If successful, all tables will be created automatically.

---

## Step 6 — Verify the Tables

In the left sidebar:

```text
Databases
└── trendora
    └── Schemas
        └── public
            └── Tables
```

You should see all created tables.

---

# Database Setup Using Terminal Commands (CLI Method)

## Step 1 — Open Terminal

Open:

- Command Prompt
- PowerShell
- Terminal
- Git Bash

---

## Step 2 — Login to PostgreSQL

```bash
psql -U postgres
```

Enter your PostgreSQL password.

---

## Step 3 — Create the Database

```sql
CREATE DATABASE trendora;
```

---

## Step 4 — Connect to the Database

```sql
\c trendora
```

---

## Step 5 — Run the Schema File

Navigate to the database folder:

```bash
cd database
```

Then execute:

```bash
psql -U postgres -d trendora -f schema.sql
```

---

## Step 6 — Verify Tables

Inside PostgreSQL run:

```sql
\dt
```

You should see all created tables.

---

# Backend Setup

Move into the backend directory:

```bash
cd "e-commerce project/backend"
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

The server should run on:

```text
http://localhost:3000
```

---

# Current Development Status

| Component | Status |
|---|---|
| Database Schema | Completed |
| Backend API | In Progress |
| Frontend UI | In Progress |
| Authentication | Planned |
| Payment Integration | Planned |
| Deployment | Planned |

---

# Future Improvements

Planned future features include:

- Authentication system
- REST API development
- Product search engine
- Order tracking
- Notifications
- Wishlist system
- Refund system
- Analytics dashboard
- Admin dashboard
- Mobile responsiveness
- Deployment infrastructure

---

# Team Members

| Name | Matricule | Role |
|---|---|---|
| ESINGILA LAUREL LUMIERE | FE24A267 | Main Leader |
| MATUTE RANSOM | FE24A307 | Vice Leader |
| ATEMKENG PRINCE LOVET TANZE | FE24A230 | Member |
| NGORAN FLORENCE | FE24A338 | Member |
| MBUH DORA FONGWI | FE24A313 | Member |
| MANAKWA BLESSING | FE24A304 | Member |
| DIONI SHAMMAH | FE24A248 | Member |
| MASUMBE SAKWE MASUMBE JR | FE24A306 | Member |
| TREVOR EFEME MOKABOE | FE24A381 | Member |
| TAMOKOUE FOGUE LANDRY | FE24A625 | Member |
| GRAI NGONG DOUORE RUDOLF | FE24A287 | Member |
| BEBONGCHU BLAISE | FE24A239 | Member |
| MEH SIMON HONORE TANCHA | FE24A316 | Member |

---

# Academic Context

This project was developed as part of coursework focused on:

- Database Design
- Database Optimization
- Database Security
- Relational Modeling
- E-commerce System Architecture

The report explores:
- system requirements
- conceptual modeling
- optimization strategies
- ACID properties
- scalability
- business impact
- feasibility analysis

---

# References

- PostgreSQL Documentation  
  https://www.postgresql.org/docs/

- Express.js Documentation  
  https://expressjs.com/

- Node.js Documentation  
  https://nodejs.org/en/docs

- GitHub Documentation  
  https://docs.github.com/

---

# License

This project was developed for academic and educational purposes.
