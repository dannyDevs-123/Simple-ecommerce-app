const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');


const app = express();

// Render sits in front of the app with a reverse proxy, so Express must trust
// the forwarded headers in production. This lets req.ip and express-rate-limit
// see the real client IP instead of the proxy's address.
const isProduction = process.env.NODE_ENV === 'production';
const trustProxy =
  process.env.TRUST_PROXY !== undefined
    ? Number(process.env.TRUST_PROXY)
    : (isProduction ? 1 : false);

if (Number.isInteger(trustProxy) || typeof trustProxy === 'boolean') {
  app.set('trust proxy', trustProxy);
} else {
  // Fall back to a safe production default if TRUST_PROXY is invalid.
  app.set('trust proxy', isProduction ? 1 : false);
}

const allowedOrigins = (process.env.CORS_ORIGINS ||
  'https://simple-ecommerce-ap.netlify.app,http://localhost:5000,http://localhost:3000,http://127.0.0.1:5500,https://ecommerce-app-ujet.onrender.com')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // req.ip depends on trust proxy, so once Express trusts Render's proxy the
  // limiter will bucket requests by the real client address.
  keyGenerator: (req) => req.ip
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files for frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
