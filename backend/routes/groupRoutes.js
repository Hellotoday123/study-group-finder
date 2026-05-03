const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  requestCollab,
  acceptCollab,
  declineCollab
} = require("../controllers/groupController");

const router = express.Router();

router.post("/", protect, createGroup);

router.get("/", getGroups);
router.get("/:id", getGroupById);

router.put("/:id", protect, updateGroup);
router.delete("/:id", protect, deleteGroup);

router.post("/:id/join", protect, joinGroup);
router.post("/:id/leave", protect, leaveGroup);

router.post("/:id/request-collab", protect, requestCollab);
router.post("/:id/accept-collab/:userId", protect, acceptCollab);
router.post("/:id/decline-collab/:userId", protect, declineCollab);

module.exports = router;