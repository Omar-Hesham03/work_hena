const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return process.env.JWT_SECRET;
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  let jwtSecret;

  try {
    jwtSecret = getJwtSecret();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication is not configured' });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user; // Add user info to request
    next();
  });
};

const isRecruiter = (req, res, next) => {
  if (!req.user || req.user.user_type !== 'recruiter') {
    return res.status(403).json({ error: 'Only recruiters can perform this action' });
  }
  next();
};
const isJobSeeker = (req, res, next) => {
  if (!req.user || req.user.user_type !== 'job_seeker') {
    return res.status(403).json({ error: 'Access denied. Job seekers only.' });
  }
  next();
};
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.user_type !== 'admin') {
    return res.status(403).json({ error: 'Only admins can perform this action' });
  }
  next();
};

module.exports = { authenticateToken, isRecruiter, isJobSeeker, isAdmin };