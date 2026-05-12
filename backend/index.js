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
const plannerRoutes = require('./routes/planner');
const scannerRoutes = require('./routes/scanner');

const app = express();

// If running behind a proxy (e.g. nginx, Vercel), enable trust proxy so cookies marked secure work.
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const corsOptions = {
    origin: true, // allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

const path = require('path');

app.use(cors(corsOptions));
// Enable preflight for all routes
app.options('*', cors(corsOptions));

app.use(express.json());
app.use('/scanned_images', express.static(path.join(__dirname, 'public', 'scanned_images')));

// Initialize Redis and session after CORS
const redisClient = createRedisClient();
app.use(createSessionMiddleware(redisClient));

// Simple logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - SID: ${req.sessionID} - Auth: ${!!req.session.userId}`);
    next();
});

// Passport
const passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

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
app.use('/api/planner', plannerRoutes);
app.use('/api/scanner', scannerRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: corsOptions
});

// Make io accessible globally via app
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // Join a room for the user to receive private updates
    socket.on('join', (userId) => {
        if (userId) {
            socket.join(`user_${userId}`);
            console.log(`Socket ${socket.id} joined room user_${userId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => console.log(`API running on port ${PORT} with WebSockets enabled`));
