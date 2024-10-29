const { Auths, Users } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const register = async (req, res, next) => {
  try {
    res.status(201).json({
      status: "Success",
      data: {},
    });
  } catch (err) {}
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await Auths.findOne({
      include: [
        {
          model: Users,
          as: "user",
        },
      ],
      where: { email: email },
    });

    console.log(user);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        isSuccess: false,
        data: null,
      });
    }

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          username: user.name,
          role: user.role,
        },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: process.env.JWT_EXPIRED,
        }
      );

      return res.status(200).json({
        status: "Success",
        message: "Succes",
        data: [
          {
            username: user.user.name,
            token: token,
          },
        ],
      });
    }

    return res.status(401).json({
      status: "Failed",
      message: "Password is incorrect",
      isSuccess: false,
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message,
      isSuccess: false,
      data: null,
    });
  }
};

const authenticate = async (req, res) => {
  try {
    res.status(200).json({
      status: "Success",
      data: {
        user: req.user,
      },
    });
  } catch (err) {}
};

module.exports = {
  register,
  login,
  authenticate,
};
