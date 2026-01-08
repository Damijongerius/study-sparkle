const session = require('express-session');
const RedisStore = require('connect-redis').default;

const createSessionMiddleware = (redisClient) => {
  return session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    }
  });
};

module.exports = createSessionMiddleware;

