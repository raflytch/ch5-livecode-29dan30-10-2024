const jwt = require("jsonwebtoken");
const { Users } = require("../models");
module.exports = async (req, res, next) => {
  console.log(req.headers.authorization);

  try {
    const bearerToken = req.headers.authorization;

    if (!bearerToken) {
      return res.status(401).json({
        status: "Failed",
        message: "Token is required",
        isSuccess: false,
        data: null,
      });
    }

    const token = bearerToken.split("Bearer ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await Users.findOne({
      where: {
        id: payload.id,
      },
    });

    if (!payload) {
      return res.status(401).json({
        status: "Failed",
        message: "Unauthorized",
        isSuccess: false,
        data: null,
      });
    }

    if (!user) {
      return res.status(401).json({
        status: "Failed",
        message: "User not found",
        isSuccess: false,
        data: null,
      });
    }

    req.user = user;
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }

  next();
};
