// backend/index.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const createRedisClient = require('./config/redis');
const createSessionMiddleware = require('./config/session');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const activityRoutes = require('./routes/activity');
const pointsRoutes = require('./routes/points');
const notificationsRoutes = require('./routes/notifications');
const cardsRoutes = require('./routes/cards');
const friendsRoutes = require('./routes/friends');
const giftCardRoutes = require('./routes/giftCard');

const app = express();

// If running behind a proxy (e.g. nginx, Vercel), enable trust proxy so cookies marked secure work.
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const corsOptions = process.env.NODE_ENV === 'development' ? {
    origin: true, // allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
} : {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl) or from the configured frontend
        if (!origin || origin === FRONTEND_URL) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy: Origin not allowed'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Enable preflight for all routes
app.options('*', cors(corsOptions));

app.use(express.json());

// Initialize Redis and session after CORS
const redisClient = createRedisClient();
app.use(createSessionMiddleware(redisClient));

// Make redisClient available to routes (for session invalidation)
app.use((req, res, next) => {
    req.redisClient = redisClient;
    next();
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/gift-card', giftCardRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
