const jwt = require('jsonwebtoken');

const sanitizeResponseUserNames = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    let isAdmin = false;

    // 1. Check req.user (populated by verifyToken on auth routes)
    if (req.user && req.user.role === 'admin') {
      isAdmin = true;
    } else {
      // 2. Check Authorization header directly (for public or unauthenticated routes)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'OFOW_SUPER_SECRET_KEY');
          if (decoded && decoded.role === 'admin') {
            isAdmin = true;
          }
        } catch (e) {
          // Token is invalid/expired, treat as non-admin
        }
      }
    }

    // If the requester is not an admin, sanitize the user data recursively
    if (!isAdmin && data) {
      const sanitize = (val) => {
        if (Array.isArray(val)) {
          return val.map(sanitize);
        } else if (val && typeof val === 'object') {
          // If it's a Mongoose document, convert to plain object
          let obj = val.toObject ? val.toObject() : val;

          // A user object/subdocument in OFOW typically has email and full_name
          if (obj.email && obj.full_name !== undefined) {
            obj.full_name = obj.email.split('@')[0];
          }

          // Recursively sanitize all object properties
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              obj[key] = sanitize(obj[key]);
            }
          }
          return obj;
        }
        return val;
      };

      data = sanitize(data);
    }

    return originalJson.call(this, data);
  };

  next();
};

module.exports = sanitizeResponseUserNames;
