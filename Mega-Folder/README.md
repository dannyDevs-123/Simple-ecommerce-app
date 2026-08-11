# ShopRigh E-Commerce Application

A full-stack e-commerce storefront built with a Node.js + Express backend and a static HTML/CSS/JavaScript frontend. The app includes user authentication, product browsing, cart management, checkout, and order history.

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT + bcrypt
- Security: Helmet, CORS, rate limiting, compression

## Project Structure


Mega-Folder/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── css/
│   ├── js/
│   ├── admin.html
│   ├── cart.html
│   ├── checkout.html
│   ├── index.html
│   ├── login.html
│   ├── order-confirmation.html
│   ├── product-details.html
│   ├── profile.html
│   └── register.html
├── tests/
│   └── category-scroll.test.js
├── README.md
└── package.json
```

## Features

- User registration and login
- JWT-protected user sessions
- Product catalog with category and search support
- Product details pages
- Shopping cart with add, update, and remove actions
- Checkout flow with order creation
- Order history and profile details
- Admin product management routes
- Responsive storefront design
- Seeded sample products for testing and demos

## Prerequisites

Before running the app, make sure you have:

- Node.js 18+
- MongoDB database connection
- A package manager such as npm
- A static file server such as VS Code Live Server or `npx serve`

## Backend Setup

1. Open a terminal and navigate to the backend folder:

```bash
cd Mega-Folder/backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend folder with the following values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:5500
```

4. Seed the database with sample products:

```bash
npm run seed
```

5. Start the backend server:

```bash
npm start
```

The API will run at:


http://localhost:5000
```

## Frontend Setup

The frontend is a static app served directly from the `frontend` folder.

### Option 1: VS Code Live Server
- Open the `frontend` folder in VS Code
- Right-click on `index.html`
- Choose “Open with Live Server”

### Option 2: Local static server

```bash
cd Mega-Folder
npx serve frontend
```

Then open the URL shown in the terminal, usually:


http://localhost:3000


## API Overview

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in an existing user |
| GET | `/api/auth/me` | Get authenticated user info |
| PUT | `/api/auth/profile` | Update profile details |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/categories` | Get all categories |
| GET | `/api/products/category/:category` | Get products by category |
| GET | `/api/products/search` | Search products |
| POST | `/api/products` | Create a product (admin) |
| POST | `/api/products/:id/reviews` | Add a review |

### Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart for current user |
| POST | `/api/cart/items` | Add an item to cart |
| PUT | `/api/cart/items/:itemId` | Update cart item quantity |
| DELETE | `/api/cart/items/:itemId` | Remove item from cart |
| DELETE | `/api/cart` | Clear cart |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create an order |
| GET | `/api/orders` | Get all orders for current user |
| GET | `/api/orders/:id` | Get one order |
| PUT | `/api/orders/:id/status` | Update order status (admin) |

### Health Check

```http
GET /api/health
```

Returns server health information.

## Default Development Flow

```cmd
cd Mega-Folder/backend
npm install
cp .env.example .env   # if you have a sample env file available
npm run seed
npm start
```

Then start the frontend with Live Server or a local static server.




