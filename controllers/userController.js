const { Users } = require("../models");
const { where } = require("sequelize");
const { Op } = require("sequelize");

const findUsers = async (req, res, next) => {
  try {
    const { id, name, role, page = 1, limit = 10 } = req.query;

    const condition = {};

    if (id) {
      condition.id = {
        [Op.eq]: id,
      };
    }

    if (name) {
      condition.name = {
        [Op.iLike]: `%${name}%`,
      };
    }

    if (role) {
      condition.role = {
        [Op.eq]: role,
      };
    }

    const offset = (page - 1) * limit;

    const users = await Users.findAndCountAll({
      attributes: ["id", "name", "role"],
      where: condition,
      limit: limit,
      offset: offset,
    });

    const totalData = users.count;

    const totalPage = Math.ceil(totalData / limit);

    res.status(200).json({
      status: "Success",
      data: {
        totalData,
        totalPage,
        currentPage: page,
        users: users.rows,
      },
    });
  } catch (err) {
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);

      return res.status(400).json({
        status: "Failed",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    }

    next(err);
  }
};

const findUserById = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "Success",
      data: {
        user,
      },
    });
  } catch (err) {}
};

const updateUser = async (req, res, next) => {
  const { name, age, role, address, shopId } = req.body;
  try {
    await Users.update(
      {
        name,
        age,
        role,
        address,
        shopId,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    res.status(200).json({
      status: "Success",
      message: "sukses update user",
    });
  } catch (err) {}
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      where: {
        id: req.params.id,
      },
    });

    await Users.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "Success",
      message: "sukses delete user",
    });
  } catch (err) {}
};

module.exports = {
  findUsers,
  findUserById,
  updateUser,
  deleteUser,
};
