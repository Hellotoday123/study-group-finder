const StudyGroup = require("../models/StudyGroup");

const populateGroup = async (id) => {
  return await StudyGroup.findById(id)
    .populate("createdBy", "name email")
    .populate("members", "name email")
    .populate("collaborators", "name email")
    .populate("collabRequests", "name email");
};

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

    const populatedGroup = await populateGroup(group._id);

    req.io.emit("group-created", populatedGroup);

    res.status(201).json(populatedGroup);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create group" });
  }
};

const getGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find()
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .populate("collaborators", "name email")
      .populate("collabRequests", "name email")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to load groups" });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await populateGroup(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to load group" });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { title, subject, description, meetingTime } = req.body;

    if (!title || !subject || !description || !meetingTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isOwner = group.createdBy.toString() === req.user.id;

    const isCollaborator = group.collaborators.some(
      (userId) => userId.toString() === req.user.id
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        message: "Only the owner or collaborators can edit this group"
      });
    }

    group.title = title;
    group.subject = subject;
    group.description = description;
    group.meetingTime = meetingTime;

    await group.save();

    const updatedGroup = await populateGroup(group._id);

    req.io.emit("group-updated", updatedGroup);

    res.json(updatedGroup);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update group" });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the owner can delete this group"
      });
    }

    await group.deleteOne();

    req.io.emit("group-deleted", req.params.id);

    res.json({ message: "Group deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete group" });
  }
};

const joinGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const alreadyJoined = group.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!alreadyJoined) {
      group.members.push(req.user.id);
      await group.save();
    }

    const updatedGroup = await populateGroup(group._id);

    req.io.emit("group-joined", updatedGroup);

    res.json(updatedGroup);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to join group" });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.members = group.members.filter(
      (memberId) => memberId.toString() !== req.user.id
    );

    group.collaborators = group.collaborators.filter(
      (userId) => userId.toString() !== req.user.id
    );

    group.collabRequests = group.collabRequests.filter(
      (userId) => userId.toString() !== req.user.id
    );

    await group.save();

    const updatedGroup = await populateGroup(group._id);

    req.io.emit("group-left", updatedGroup);

    res.json(updatedGroup);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to leave group" });
  }
};

const requestCollab = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy.toString() === req.user.id) {
      return res.status(400).json({ message: "Owner cannot request collaboration" });
    }

    const alreadyCollaborator = group.collaborators.some(
      (userId) => userId.toString() === req.user.id
    );

    if (alreadyCollaborator) {
      return res.status(400).json({ message: "You are already a collaborator" });
    }

    const alreadyRequested = group.collabRequests.some(
      (userId) => userId.toString() === req.user.id
    );

    if (!alreadyRequested) {
      group.collabRequests.push(req.user.id);
      await group.save();
    }

    const updatedGroup = await populateGroup(group._id);

    req.io.emit("collab-requested", updatedGroup);

    res.json(updatedGroup);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to request collaboration" });
  }
};

const acceptCollab = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owner can accept requests" });
    }

    const requestedUserId = req.params.userId;

    group.collabRequests = group.collabRequests.filter(
      (userId) => userId.toString() !== requestedUserId
    );

    const alreadyCollaborator = group.collaborators.some(
      (userId) => userId.toString() === requestedUserId
    );

    if (!alreadyCollaborator) {
      group.collaborators.push(requestedUserId);
    }

    await group.save();

    const updatedGroup = await populateGroup(group._id);

    req.io.emit("collab-accepted", updatedGroup);

    res.json(updatedGroup);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to accept collaboration request" });
  }
};

const declineCollab = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owner can decline requests" });
    }

    const requestedUserId = req.params.userId;

    group.collabRequests = group.collabRequests.filter(
      (userId) => userId.toString() !== requestedUserId
    );

    await group.save();

    const updatedGroup = await populateGroup(group._id);

    req.io.emit("collab-declined", updatedGroup);

    res.json(updatedGroup);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to decline collaboration request" });
  }
};

module.exports = {
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
};