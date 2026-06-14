const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production';
const readLimit = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// General API rate limiter - relaxed for development, stricter by default in production
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: readLimit(process.env.API_RATE_LIMIT_MAX, isProduction ? 100 : 1000),
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for certain routes if needed
  skip: (req) => {
    // Skip rate limiting for health checks or status endpoints
    return req.path === '/' || req.path === '/health';
  }
});

// Strict rate limiter for authentication routes - 5 requests per 15 minutes per IP
// TODO: TEMPORARILY BYPASSED FOR TESTING IN DEV. RE-ENABLE BEFORE PRODUCTION.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: readLimit(process.env.AUTH_RATE_LIMIT_MAX, 5), // Limit each IP to login/register attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== 'production'
});

// Moderate rate limiter for account creation - 3 per hour
// TODO: TEMPORARILY BYPASSED FOR TESTING IN DEV. RE-ENABLE BEFORE PRODUCTION.
const accountCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: readLimit(process.env.ACCOUNT_CREATION_RATE_LIMIT_MAX, 3),
  message: {
    error: 'Too many accounts created from this IP, please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== 'production'
});

// Rate limiter for job posting - 10 posts per hour (prevent spam)
const jobPostingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: readLimit(process.env.JOB_POST_RATE_LIMIT_MAX, isProduction ? 10 : 15),
  message: {
    error: 'Too many jobs posted, please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for job applications - 20 per day
const applicationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: readLimit(process.env.APPLICATION_RATE_LIMIT_MAX, 20),
  message: {
    error: 'Too many applications submitted today, please try again tomorrow.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for notification/invitation sending - 30 per hour
const notificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: readLimit(process.env.NOTIFICATION_RATE_LIMIT_MAX, 30),
  message: {
    error: 'Too many invitations sent, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for profile updates - 20 per hour
const profileUpdateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: readLimit(process.env.PROFILE_UPDATE_RATE_LIMIT_MAX, 20),
  message: {
    error: 'Too many profile updates, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  accountCreationLimiter,
  jobPostingLimiter,
  applicationLimiter,
  notificationLimiter,
  profileUpdateLimiter
};