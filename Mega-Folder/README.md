# ShopHub - Full-Stack E-Commerce Application

## Tech Stack
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env and add your MongoDB password and secrets
npm install
npm run seed    # Seed sample products
npm start       # Start server on port 5000
```

### 2. Frontend Setup
Serve the `frontend` folder with any static server:
```bash
# Using VS Code Live Server, or:
npx serve frontend
# Or simply open index.html with Live Server extension
```

### 3. Environment Variables (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://donfanky123_db_user:YOUR_PASSWORD@cluster0.q3m8kem.mongodb.net/ecommerce_db?appName=Cluster0
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
NODE_ENV=development
```

## Features Implemented
- User Registration & Login (bcrypt + JWT)
- Product catalog with search, categories, sorting, pagination
- Shopping cart (add, update, remove, persistent per user)
- Multi-step checkout with shipping & payment simulation
- Order history in user profile
- Responsive mobile-first design
- Toast notifications & loading states
- 22 sample products seeded

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/products | List products |
| GET | /api/products/:id | Product details |
| GET | /api/cart | View cart |
| POST | /api/cart/items | Add to cart |
| POST | /api/orders | Create order |
| GET | /api/orders | List orders |
