const { where } = require("sequelize");
const { Shops, Products, Users } = require("../models");
const { Op } = require("sequelize");

const createShop = async (req, res) => {
  const { name, adminEmail, userId } = req.body;

  try {
    const newShop = await Shops.create({
      name,
      adminEmail,
      userId: req.user.id,
    });

    res.status(201).json({
      status: "Success",
      message: "Success create new Shop",
      isSuccess: true,
      data: {
        newShop,
      },
    });
  } catch (error) {
    console.log(error.name);
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);
      return res.status(400).json({
        status: "Failed",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    } else if (error.name === "SequelizeDatabaseError") {
      return res.status(400).json({
        status: "Failed",
        message: error.message,
        isSuccess: false,
        data: null,
      });
    } else {
      res.status(500).json({
        status: "Failed",
        message: "An unexpected error occurred",
        isSuccess: false,
        data: null,
      });
    }
  }
};

const getAllShop = async (req, res) => {
  try {
    // Jaga req.query biar gak kemana-mana
    const {
      shopName,
      adminEmail,
      productName,
      stock,
      page = 1,
      limit = 10,
    } = req.query;

    const condition = {};

    if (shopName) {
      condition.name = {
        [Op.iLike]: `%${shopName}%`,
      };
    }

    const productCondition = {};

    if (productName) {
      productCondition.name = {
        [Op.iLike]: `%${productName}%`,
      };
    }

    if (stock) {
      productCondition.stock = {
        [Op.gte]: stock,
      };
    }

    let prevPage = page - 1;
    if (prevPage < 1) prevPage = 1;

    const offset = (page - 1) * limit;

    // (tanpa limit dan offset)
    const totalData = await Shops.count({
      include: [
        {
          model: Products,
          as: "products",
          where: productCondition,
        },
        {
          model: Users,
          as: "user",
        },
      ],
      where: condition,
    });

    const totalPages = Math.ceil(totalData / limit);

    // Query untuk mendapatkan data shops dengan limit dan offset
    const shops = await Shops.findAll({
      include: [
        {
          model: Products,
          as: "products",
          attributes: ["name", "images", "stock", "price"],
          where: productCondition,
        },
        {
          model: Users,
          as: "user",
          attributes: ["name"],
        },
      ],
      attributes: ["name", "adminEmail"],
      where: condition,
      limit: limit,
      offset: offset,
    });

    let nextPage = Number(page) + 1;
    nextPage = nextPage > totalPages ? totalPages : nextPage;

    res.status(200).json({
      status: "Success",
      message: "Success get shops data",
      isSuccess: true,
      data: {
        totalData,
        totalPages,
        prevPage: prevPage,
        currentPage: page,
        nextPage: nextPage,
        shops: shops,
      },
    });
  } catch (error) {
    console.log(error.name);
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);
      return res.status(400).json({
        status: "Fail",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    }

    res.status(500).json({
      status: "Fail",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

const getShopById = async (req, res) => {
  const id = req.params.id;

  try {
    const Shop = await Shops.findOne({
      where: {
        id,
      },
    });

    res.status(200).json({
      status: "Success",
      message: "Success get shop data",
      isSuccess: true,
      data: {
        Shop,
      },
    });
  } catch (error) {
    console.log(error.name);
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);
      return res.status(400).json({
        status: "Fail",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    }

    res.status(500).json({
      status: "Fail",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

const updateShop = async (req, res) => {
  const id = req.params.id;
  const { name, adminEmail } = req.body;

  try {
    const Shop = await Shops.findOne({
      where: {
        id,
      },
    });

    if (!Shop) {
      res.status(404).json({
        status: "Fail",
        message: "Data not found",
        isSuccess: false,
        data: null,
      });
    }

    await Shops.update({
      name,
      adminEmail,
    });

    res.status(200).json({
      status: "Success",
      message: "Success update shop",
      isSuccess: true,
      data: {
        Shop: {
          id,
          name,
          stock,
          price,
        },
      },
    });
  } catch (error) {
    console.log(error.name);
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);
      return res.status(400).json({
        status: "Fail",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    }

    res.status(500).json({
      status: "Fail",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

const deleteShop = async (req, res) => {
  const id = req.params.id;

  try {
    const Shop = await Shops.findOne({
      where: {
        id,
      },
    });

    if (!Shop) {
      res.status(404).json({
        status: "Fail",
        message: "Data not found",
        isSuccess: false,
        data: null,
      });
    }

    await Shops.destroy();

    res.status(200).json({
      status: "Success",
      message: "Success delete shop",
      isSuccess: true,
      data: null,
    });
  } catch (error) {
    console.log(error.name);
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);
      return res.status(400).json({
        status: "Fail",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    }

    res.status(500).json({
      status: "Fail",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

module.exports = {
  createShop,
  getAllShop,
  getShopById,
  updateShop,
  deleteShop,
};
