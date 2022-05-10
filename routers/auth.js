const jwt = require("jsonwebtoken");

const authToken = (req, res, next) => {
  let authHeader;
  if (req.headers.cookie) authHeader = req.headers.cookie.split("=")[1];
  // req.headers.token;
  if (authHeader) {
    jwt.verify(authHeader, process.env.JWT_SECRET, (err, user) => {
      if (err) res.status(403).json("Token is not valid! Please login or Register");
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated! Please login or Register");
  }
};

module.exports = authToken;
