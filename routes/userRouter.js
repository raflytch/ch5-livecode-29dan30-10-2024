const router = require("express").Router();

// const { authController } = require("../controllers");
const { userController } = require("../controllers");

router.get("", userController.findUsers);
router.get("/:id", userController.findUserById);
router.patch("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
