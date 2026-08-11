# Name:ShopRight

A simple fullStack online store where you can browse products, add them to your cart, and place orders. Nothing fancy, just works.

---

## (Tech Stack)

**Frontend** – Plain HTML, CSS, and JavaScript.  
**Backend** – Node.js with Express. Handles all the logic.  
**Database** – MongoDB Atlas (cloud). Stores users, products, orders.  
**Login** – JWT tokens. Keeps you logged in.

---

## How to run this thing

### 1. Set up the backend

Open your terminal and go to the backend folder:

```bash
cd backend
```

Copy the example environment file:

```bash
cp .env.example .env
```

Now open `.env` and add your MongoDB password and secret keys. Don't skip this.

Install everything:

```bash
npm install
```

Add some dummy products to the database:

```bash
npm run seed
```

Start the server:

```bash
npm start
```

It'll run on `http://localhost:5000`.

---

### 2. Set up the frontend

The frontend is just static files. You can serve it any way you like.

**Easy way** – If you're using VS Code, install the Live Server extension, right-click `index.html`, and click "Open with Live Server".

**Or use this**:

```bash
npx serve frontend
```

That's it. Open the URL it gives you and start poking around.

---

## What you can do

- **Sign up / Log in** – Create an account or log in if you already have one
- **Browse products** – Scroll through the catalog. Search for stuff. Filter by category.
- **Add to cart** – Pick items, change quantities, remove things you don't want
- **Checkout** – Enter shipping details, "pay" (it's simulated, don't worry), and place your order
- **See order history** – All your past orders live in your profile
- **Works on phones** – Yeah, it's responsive. Looks decent on small screens too.
- **Loading spinners** – You'll see them when things are loading. No guessing if the app froze.
- **Toast notifications** – Little popups that tell you what just happened (success, error, etc.)

---

## Stuff you need to set in `.env`

Here's what your `.env` file should look like:

```
PORT=5000
MONGODB_URI=mongodb+srv://donfanky123_db_user:YOUR_PASSWORD@cluster0.q3m8kem.mongodb.net/ecommerce_db?appName=Cluster0
JWT_SECRET=make_up_something_random_here
SESSION_SECRET=another_random_string_here
NODE_ENV=development
```




## API endpoints 

| What it does | Endpoint | Method |
|--------------|----------|--------|
| Create account | `/api/auth/register` | POST |
| Log in | `/api/auth/login` | POST |
| Get your info | `/api/auth/me` | GET |
| List all products | `/api/products` | GET |
| Get one product | `/api/products/:id` | GET |
| View your cart | `/api/cart` | GET |
| Add to cart | `/api/cart/items` | POST |
| Place an order | `/api/orders` | POST |
| See your orders | `/api/orders` | GET |

---
