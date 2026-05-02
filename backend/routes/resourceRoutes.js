const express = require("express");
const Resource = require("../models/Resource");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const resource = await Resource.create({
    ...req.body,
    createdBy: req.user.id
  });

  req.io.emit("resource-created", resource);

  res.status(201).json(resource);
});

router.get("/", async (req, res) => {
  const resources = await Resource.find().populate("createdBy", "name email");
  res.json(resources);
});

router.get("/:id", async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  res.json(resource);
});

router.put("/:id", protect, async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(resource);
});

router.delete("/:id", protect, async (req, res) => {
  await Resource.findByIdAndDelete(req.params.id);
  res.json({ message: "Resource deleted" });
});

module.exports = router;