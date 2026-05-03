const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup
} = require("../controllers/groupController");

const router = express.Router();

router.post("/", protect, createGroup);
router.get("/", getGroups);
router.get("/:id", getGroupById);
router.put("/:id", protect, updateGroup);
router.delete("/:id", protect, deleteGroup);

module.exports = router;