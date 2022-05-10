const Sequelize = require("sequelize");
const OTP_Model = require("./models/OTP");

const OTP = OTP_Model(Sequelize);

module.exports = { OTP };
