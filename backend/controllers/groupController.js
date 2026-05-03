const StudyGroup = require("../models/StudyGroup");

// helper
const populateGroup = async (id) => {
  return await StudyGroup.findById(id)
    .populate("createdBy", "name email")
    .populate("members", "name email")
    .populate("collaborators", "name email")
    .populate("collabRequests", "name email");
};

// CREATE
const createGroup = async (req, res) => {
  try {
    const { title, subject, description, meetingTime } = req.body;

    if (!title || !subject || !description || !meetingTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const group = await StudyGroup.create({
      title,
      subject,
      description,
      meetingTime,
      createdBy: req.user.id,
      members: [req.user.id],
      collaborators: [],
      collabRequests: []
    });

    const populated = await populateGroup(group._id);

    req.io.emit("group-created", populated);

    res.status(201).json(populated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create group" });
  }
};

// GET ALL
const getGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find()
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .populate("collaborators", "name email")
      .populate("collabRequests", "name email");

    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Failed to load groups" });
  }
};

// UPDATE (owner OR collaborator)
const updateGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) return res.status(404).json({ message: "Not found" });

    const isOwner = group.createdBy.toString() === req.user.id;

    const isCollab = group.collaborators.some(
      (id) => id.toString() === req.user.id
    );

    if (!isOwner && !isCollab) {
      return res.status(403).json({ message: "Not allowed" });
    }

    Object.assign(group, req.body);
    await group.save();

    const updated = await populateGroup(group._id);

    req.io.emit("group-updated", updated);

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
};

// DELETE (ONLY owner)
const deleteGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) return res.status(404).json({ message: "Not found" });

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owner can delete" });
    }

    await group.deleteOne();

    req.io.emit("group-deleted", req.params.id);

    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};

// JOIN
const joinGroup = async (req, res) => {
  const group = await StudyGroup.findById(req.params.id);

  if (!group) return res.status(404).json({ message: "Not found" });

  if (!group.members.includes(req.user.id)) {
    group.members.push(req.user.id);
    await group.save();
  }

  const updated = await populateGroup(group._id);

  req.io.emit("group-joined", updated);

  res.json(updated);
};

// LEAVE
const leaveGroup = async (req, res) => {
  const group = await StudyGroup.findById(req.params.id);

  if (!group) return res.status(404).json({ message: "Not found" });

  group.members = group.members.filter(
    (id) => id.toString() !== req.user.id
  );

  group.collaborators = group.collaborators.filter(
    (id) => id.toString() !== req.user.id
  );

  group.collabRequests = group.collabRequests.filter(
    (id) => id.toString() !== req.user.id
  );

  await group.save();

  const updated = await populateGroup(group._id);

  req.io.emit("group-left", updated);

  res.json(updated);
};

// REQUEST COLLAB
const requestCollab = async (req, res) => {
  const group = await StudyGroup.findById(req.params.id);

  if (!group) return res.status(404).json({ message: "Not found" });

  if (!group.collabRequests.includes(req.user.id)) {
    group.collabRequests.push(req.user.id);
    await group.save();
  }

  const updated = await populateGroup(group._id);

  req.io.emit("collab-requested", updated);

  res.json(updated);
};

// ACCEPT
const acceptCollab = async (req, res) => {
  const group = await StudyGroup.findById(req.params.id);

  if (group.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "Only owner" });
  }

  const userId = req.params.userId;

  group.collabRequests = group.collabRequests.filter(
    (id) => id.toString() !== userId
  );

  if (!group.collaborators.includes(userId)) {
    group.collaborators.push(userId);
  }

  await group.save();

  const updated = await populateGroup(group._id);

  req.io.emit("collab-accepted", updated);

  res.json(updated);
};

// DECLINE
const declineCollab = async (req, res) => {
  const group = await StudyGroup.findById(req.params.id);

  if (group.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "Only owner" });
  }

  const userId = req.params.userId;

  group.collabRequests = group.collabRequests.filter(
    (id) => id.toString() !== userId
  );

  await group.save();

  const updated = await populateGroup(group._id);

  req.io.emit("collab-declined", updated);

  res.json(updated);
};

module.exports = {
  createGroup,
  getGroups,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  requestCollab,
  acceptCollab,
  declineCollab
};