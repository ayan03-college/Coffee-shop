# ☕ Brewhouse — Coffee Shop E-Commerce Platform

A full-stack, production-ready coffee shop e-commerce website with a premium UI, built with the
MERN stack (MongoDB, Express, React, Node.js).

**Live features:** authentication, coffee menu with filters/search/sort, product details with
size/quantity selection, cart, coupon system, checkout (COD + Stripe test mode), order tracking,
reviews & ratings, wishlist, admin dashboard with sales analytics, and an AI Barista chat
assistant powered by Claude.

---
## 👥 Project Team

This project was developed as a group project by:

1. Roll no. 494 - Sania Satvilkar — GitHub: g24.sania.satvilkar@gnkhalsa.edu.in
2. Roll no. 509 - Rafat Surve — GitHub: g24.rafat.surve@gnkhalsa.edu.in
3. Roll no. 542 - Ayan Khan— GitHub: g24.ayan.khan@gnkhalsa.edu.in
   
## 📁 Project Structure

```
coffee-shop/
├── backend/                 # Node.js + Express + MongoDB API
│   ├── config/               # Database connection
│   ├── controllers/          # Route handler logic
│   ├── middleware/           # Auth, error handling
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express routers
│   ├── utils/                  # Helpers (JWT, async wrapper)
│   ├── seed.js                 # Seeds 30+ products, admin/demo users, coupons
│   ├── server.js               # App entry point
│   └── .env.example
├── client/                   # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/            # Auth, Cart, Theme providers
│   │   ├── pages/               # Route-level pages (incl. pages/admin)
│   │   ├── services/            # Axios API client
│   │   └── App.jsx, main.jsx, index.css
│   └── .env.example
├── package.json              # Root convenience scripts (dev/install/build)
└── render.yaml                # Render deployment blueprint
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local MongoDB or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- (Optional) A [Stripe](https://dashboard.stripe.com/register) test-mode secret key for Card/UPI checkout
- (Optional) An [Anthropic API key](https://console.anthropic.com/) to enable the AI Barista chat

### 1. Clone & configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# then edit backend/.env and set at minimum: MONGO_URI, JWT_SECRET

# Frontend
cp client/.env.example client/.env
# defaults to http://localhost:5000/api which matches the backend above
```

### 2. Install dependencies (from the project root)

```bash
npm install
```

This installs root, `backend/`, and `client/` dependencies automatically via `postinstall`.

### 3. Seed the database (products, admin user, coupons)

```bash
npm run seed
```

This creates:
- **30+ coffee products** across all 8 categories
- An **admin account**: `admin@coffeeshop.com` / `Admin@12345` (or whatever you set in `.env`)
- A **demo customer account**: `demo@coffeeshop.com` / `Demo@12345`
- **3 coupons**: `WELCOME10` (10% off), `COFFEE20` (20% off orders ≥ ₹300), `FIRSTORDER` (₹200 off orders ≥ ₹500)

### 4. Run both servers together

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

> You can also run them separately: `npm run dev --prefix backend` and `npm run dev --prefix client`.

---

## 🔑 Environment Variables

### `backend/.env`
| Variable | Description |
|---|---|
| `PORT` | Backend port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `JWT_EXPIRE` | Token lifetime (default `7d`) |
| `STRIPE_SECRET_KEY` | Stripe test secret key (`sk_test_...`) — Card/UPI checkout returns a clear error if unset, COD still works |
| `ANTHROPIC_API_KEY` | Claude API key — powers the AI Barista chat; feature auto-disables with a friendly message if unset |
| `CLIENT_URL` | Frontend origin for CORS (default `http://localhost:5173`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by the seed script to create the admin account |

### `client/.env`
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (default `http://localhost:5000/api`) |

---

## 🧾 API Documentation

Base URL: `/api`

### Auth (`/api/auth`)
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register (name, email, password, confirmPassword) |
| POST | `/login` | Public | Login, returns JWT + user |
| GET | `/profile` | Private | Get current user |
| PUT | `/profile` | Private | Update name/phone/avatar |
| POST | `/address` | Private | Add a saved address |
| DELETE | `/address/:addressId` | Private | Remove a saved address |

### Products (`/api/products`)
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List products — supports `category`, `search`, `sort` (`price_asc`/`price_desc`/`rating`), `featured`, `newArrival`, `todaySpecial`, `bestSeller`, `page`, `limit` |
| GET | `/search/suggestions?q=` | Public | Live search-as-you-type suggestions |
| GET | `/:id` | Public | Product by ID or slug, plus 4 related products |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Delete product |

### Cart (`/api/cart`) — all routes Private
| Method | Route | Description |
|---|---|---|
| GET | `/` | Get the logged-in user's cart |
| POST | `/` | Add item `{ productId, size, quantity }` |
| PUT | `/` | Update item quantity `{ itemId, quantity }` (quantity ≤ 0 removes it) |
| DELETE | `/:itemId` | Remove one item |
| DELETE | `/` | Clear the entire cart |

### Coupons (`/api/coupon`)
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/apply` | Private | Apply `{ code }` to the current cart |
| DELETE | `/remove` | Private | Remove applied coupon |
| GET | `/` | Admin | List all coupons |
| POST | `/` | Admin | Create coupon |
| PUT | `/:id` | Admin | Update coupon |
| DELETE | `/:id` | Admin | Delete coupon |

### Checkout & Orders
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/checkout` | Private | Places the order from the cart (GST 5%, ₹40 delivery waived over ₹500, Stripe PaymentIntent for Card/UPI) |
| POST | `/api/checkout/payment-intent` | Private | Creates a Stripe PaymentIntent client secret for the current cart total |
| GET | `/api/orders` | Private | Current user's order history |
| GET | `/api/orders/:id` | Private | Single order (owner or admin) |
| PUT | `/api/orders/:id/cancel` | Private | Cancel own order (only while `Pending`) |
| GET | `/api/orders/admin/all` | Admin | All orders, filterable by `status` |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| GET | `/api/orders/admin/analytics` | Admin | Revenue, order counts, top-selling coffees, 7-day revenue trend |

### Reviews (`/api/reviews`)
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/:productId` | Public | All reviews for a product |
| POST | `/` | Private | Create review `{ productId, rating, comment }` (one per user per product) |
| PUT | `/:id` | Private | Edit own review |
| DELETE | `/:id` | Private | Delete own review (or any review, if admin) |

### Users / Wishlist (`/api/users`)
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/wishlist` | Private | Get wishlist |
| POST | `/wishlist/:productId` | Private | Add to wishlist |
| DELETE | `/wishlist/:productId` | Private | Remove from wishlist |
| GET | `/` | Admin | List all users |
| PUT | `/:id` | Admin | Update role / active status |
| DELETE | `/:id` | Admin | Delete user |

### AI Barista (`/api/ai`)
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/barista` | Public | Chat with "Milo", the AI barista, for drink recommendations and FAQ — grounded in the live menu |

---

## 🗄️ MongoDB Collections

- **User** — name, email, hashed password, role (`user`/`admin`), addresses, wishlist
- **Product** — name, slug, description, ingredients, nutrition, price, sizes, category, rating, flags (featured/new/special/bestseller)
- **Cart** — one per user, embedded items + applied coupon
- **Coupon** — code, type (percentage/flat), value, min order, expiry, usage limits
- **Order** — items snapshot, customer info, payment info, GST/delivery/discount breakdown, status history
- **Review** — product, user, rating, comment (unique per user+product)

---

## 💳 Testing Stripe Payments

1. Get free test-mode keys at https://dashboard.stripe.com/test/apikeys
2. Set `STRIPE_SECRET_KEY` in `backend/.env`
3. At checkout, choose **Card** or **UPI**, then use Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC.

If `STRIPE_SECRET_KEY` isn't set, Card/UPI checkout returns a clear error message and **Cash on Delivery** still works end-to-end.

---

## 🤖 AI Barista (Claude-powered)

The floating chat bubble in the bottom-right corner lets customers chat with "Milo," an AI
barista built on the Claude API (`claude-sonnet-4-6`). It's grounded in your live product catalog
so it only recommends real menu items. Set `ANTHROPIC_API_KEY` in `backend/.env` to enable it —
without a key, the widget stays visible but shows a friendly "not configured" message.

---

## ☁️ Deployment Guide

### 1. MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user and allow access from `0.0.0.0/0` (or your hosting provider's IPs)
3. Copy the connection string into `MONGO_URI`

### 2. Backend → Render
1. Push this repo to GitHub
2. On [Render](https://render.com), create a new Web Service pointing at the `backend/` folder
   (or use the included `render.yaml` blueprint from the repo root)
3. Build command: `npm install` · Start command: `npm start`
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `ANTHROPIC_API_KEY`, `CLIENT_URL` (your Vercel URL)
5. Deploy, then run the seed script once via Render's Shell tab: `node seed.js`

### 3. Frontend → Vercel
1. On [Vercel](https://vercel.com), import the `client/` folder as the project root
2. Framework preset: Vite · Build command: `npm run build` · Output: `dist`
3. Add environment variable `VITE_API_URL` pointing at your Render backend, e.g. `https://your-backend.onrender.com/api`
4. Deploy

### 4. Update CORS
Once both are deployed, set `CLIENT_URL` on the backend to your live Vercel URL so CORS allows requests from production.

---

## 🔐 Security Measures

- Passwords hashed with bcrypt
- JWT-based authentication with route protection middleware
- `helmet` for secure HTTP headers
- `express-rate-limit` (300 requests / 15 min per IP on `/api`)
- `express-mongo-sanitize` to prevent NoSQL injection
- CORS restricted to the configured client origin
- Environment variables for all secrets (never committed)
- Server-side input validation on all mutating routes

---

## 🎨 Design System

- **Colors:** Espresso `#3B2417`, Bean `#6F4E37`, Mocha `#8B4513`, Latte `#C4A484`, Cream `#F5F5DC`, Foam `#FFF8F0`
- **Typography:** Playfair Display (headings) + Inter (body)
- **Effects:** Glassmorphism navbar, rounded cards, soft shadows, shimmer loading skeletons
- **Animations:** Framer Motion — fade/slide-ins, hover lifts, page transitions, animated dashboard bars
- **Dark mode:** Full light/dark theme toggle, persisted in `localStorage`
- Fully responsive across desktop, tablet, and mobile breakpoints

---

## 🧪 Default Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@coffeeshop.com` | `Admin@12345` |
| Customer | `demo@coffeeshop.com` | `Demo@12345` |

## 🎟️ Default Coupons (after seeding)

| Code | Discount | Condition |
| `WELCOME10` | 10% off (max ₹150) | No minimum |
| `COFFEE20` | 20% off (max ₹300) | Orders ≥ ₹300 |
| `FIRSTORDER` | ₹200 flat off | Orders ≥ ₹500 |

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Router 6, Axios, react-hot-toast, lucide-react
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Helmet, express-rate-limit, Stripe SDK, Anthropic SDK
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)
