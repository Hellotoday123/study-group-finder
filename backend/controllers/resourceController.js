const Resource = require("../models/Resource");

const createResource = async (req, res) => {
  try {
    const { title, link, subject } = req.body;

    if (!title || !link || !subject) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      return res.status(400).json({
        message: "Invalid link format"
      });
    }

    const resource = await Resource.create({
      title,
      link,
      subject,
      createdBy: req.user.id
    });

    const populatedResource = await Resource.findById(resource._id).populate(
      "createdBy",
      "name email"
    );

    req.io.emit("resource-created", populatedResource);

    res.status(201).json(populatedResource);
  } catch (err) {
    res.status(500).json({ message: "Failed to create resource" });
  }
};

const getResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: "Failed to load resources" });
  }
};

const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: "Failed to load resource" });
  }
};

const updateResource = async (req, res) => {
  try {
    const { title, link, subject } = req.body;

    if (!title || !link || !subject) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      return res.status(400).json({
        message: "Invalid link format"
      });
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only edit your own resources"
      });
    }

    resource.title = title;
    resource.link = link;
    resource.subject = subject;

    await resource.save();

    const updatedResource = await Resource.findById(resource._id).populate(
      "createdBy",
      "name email"
    );

    req.io.emit("resource-updated", updatedResource);

    res.json(updatedResource);
  } catch (err) {
    res.status(500).json({ message: "Failed to update resource" });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own resources"
      });
    }

    await resource.deleteOne();

    req.io.emit("resource-deleted", req.params.id);

    res.json({ message: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete resource" });
  }
};

module.exports = {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource
};