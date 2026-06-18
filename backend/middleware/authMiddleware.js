const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  let token = null;
  const authHeader = req.header("Authorization");

  if (authHeader) {
    token = authHeader.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    const error = new Error("No token, authorization denied");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    err.statusCode = 401;
    next(err);
  }
};

module.exports = authMiddleware;