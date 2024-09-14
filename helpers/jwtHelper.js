const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

module.exports.generateToken = (payload) => {
  const secretKey = process.env.SECRET_KEY; // Replace with your own secret key
  const options = {
    expiresIn: "1h", // Token expiration time
  };

  const token = jwt.sign(payload, secretKey, options);
  return token;
};
