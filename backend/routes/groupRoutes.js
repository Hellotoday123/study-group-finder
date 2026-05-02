const express = require("express");
const StudyGroup = require("../models/StudyGroup");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const group = await StudyGroup.create({
    ...req.body,
    createdBy: req.user.id
  });

  req.io.emit("group-created", group);

  res.status(201).json(group);
});

router.get("/", async (req, res) => {
  const groups = await StudyGroup.find().populate("createdBy", "name email");
  res.json(groups);
});

router.get("/:id", async (req, res) => {
  const group = await StudyGroup.findById(req.params.id);
  res.json(group);
});

router.put("/:id", protect, async (req, res) => {
  const group = await StudyGroup.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  req.io.emit("group-updated", group);

  res.json(group);
});

router.delete("/:id", protect, async (req, res) => {
  await StudyGroup.findByIdAndDelete(req.params.id);

  req.io.emit("group-deleted", req.params.id);

  res.json({ message: "Group deleted" });
});

module.exports = router;