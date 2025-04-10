const adminMiddleware = (req, res, next) => {
    if (req.user?.role === 'admin') return next();
    res.status(403).json({ success: false, message: "Admin access required" });
  };
  
  module.exports = adminMiddleware;