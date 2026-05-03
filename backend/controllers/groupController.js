const StudyGroup = require("../models/StudyGroup");

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
      members: [req.user.id]
    });

    const populatedGroup = await StudyGroup.findById(group._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

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
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to load groups" });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

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

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only edit your own groups"
      });
    }

    group.title = title;
    group.subject = subject;
    group.description = description;
    group.meetingTime = meetingTime;

    await group.save();

    const updatedGroup = await StudyGroup.findById(group._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

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
        message: "You can only delete your own groups"
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

    if (!group.members) {
      group.members = [];
    }

    const alreadyJoined = group.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!alreadyJoined) {
      group.members.push(req.user.id);
      await group.save();
    }

    const updatedGroup = await StudyGroup.findById(group._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

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

    if (!group.members) {
      group.members = [];
    }

    group.members = group.members.filter(
      (memberId) => memberId.toString() !== req.user.id
    );

    await group.save();

    const updatedGroup = await StudyGroup.findById(group._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    req.io.emit("group-left", updatedGroup);

    res.json(updatedGroup);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to leave group" });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup
};