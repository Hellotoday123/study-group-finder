import { useEffect, useState } from "react";
import API from "../services/api";
import { io } from "socket.io-client";

const socket = io("https://study-group-finder-backend-vhao.onrender.com");

function Groups() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [groups, setGroups] = useState([]);

  const [form, setForm] = useState({
    title: "",
    subject: "",
    description: "",
    meetingTime: ""
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const updateGroupInState = (updatedGroup) => {
    setGroups((old) =>
      old.map((group) =>
        group._id === updatedGroup._id ? updatedGroup : group
      )
    );
  };

  const loadGroups = async () => {
    try {
      const res = await API.get("/groups");
      setGroups(res.data);
    } catch (err) {
      setError("Failed to load groups.");
    }
  };

  useEffect(() => {
    loadGroups();

    socket.on("group-created", (newGroup) => {
      setGroups((old) => [newGroup, ...old]);
    });

    socket.on("group-updated", (updatedGroup) => {
      updateGroupInState(updatedGroup);
    });

    socket.on("group-joined", (updatedGroup) => {
      updateGroupInState(updatedGroup);
    });

    socket.on("group-left", (updatedGroup) => {
      updateGroupInState(updatedGroup);
    });

    socket.on("group-deleted", (id) => {
      setGroups((old) => old.filter((group) => group._id !== id));
    });

    return () => {
      socket.off("group-created");
      socket.off("group-updated");
      socket.off("group-joined");
      socket.off("group-left");
      socket.off("group-deleted");
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      title: "",
      subject: "",
      description: "",
      meetingTime: ""
    });

    setEditingId(null);
  };

  const createOrUpdateGroup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title || !form.subject || !form.description || !form.meetingTime) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await API.put(`/groups/${editingId}`, form);
        setSuccess("Study group updated successfully.");
      } else {
        await API.post("/groups", form);
        setSuccess("Study group created successfully.");
      }

      resetForm();
      loadGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const editGroup = (group) => {
    setEditingId(group._id);

    setForm({
      title: group.title,
      subject: group.subject,
      description: group.description,
      meetingTime: group.meetingTime
        ? new Date(group.meetingTime).toISOString().slice(0, 16)
        : ""
    });

    setError("");
    setSuccess("");
  };

  const deleteGroup = async (id) => {
    setError("");
    setSuccess("");

    try {
      await API.delete(`/groups/${id}`);
      setSuccess("Study group deleted successfully.");
      loadGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete group.");
    }
  };

  const joinGroup = async (id) => {
    setError("");
    setSuccess("");

    try {
      await API.post(`/groups/${id}/join`);
      setSuccess("You have joined the group.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join group.");
    }
  };

  const leaveGroup = async (id) => {
    setError("");
    setSuccess("");

    try {
      await API.post(`/groups/${id}/leave`);
      setSuccess("You have left the group.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave group.");
    }
  };

  const isOwner = (group) => {
    return group.createdBy?._id === user?._id || group.createdBy === user?._id;
  };

  const isMember = (group) => {
    return group.members?.some(
      (member) => member._id === user?._id || member === user?._id
    );
  };

  return (
    <div>
      <div className="card">
        <h2>{editingId ? "Edit Study Group" : "Create Study Group"}</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form onSubmit={createOrUpdateGroup}>
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
          />

          <input
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
          />

          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />

          <input
            type="datetime-local"
            name="meetingTime"
            value={form.meetingTime}
            onChange={handleChange}
          />

          <button disabled={loading}>
            {loading
              ? "Saving..."
              : editingId
              ? "Update Group"
              : "Add Group"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <h2>Available Study Groups</h2>

      <div className="grid">
        {groups.map((group) => (
          <div className="card" key={group._id}>
            <span className="badge">{group.subject}</span>

            <h3>{group.title}</h3>

            <p>{group.description}</p>

            <p>{new Date(group.meetingTime).toLocaleString()}</p>

            {group.createdBy && (
              <p>
                Created by:{" "}
                {group.createdBy.name || group.createdBy.email || "User"}
              </p>
            )}

            <p>Members: {group.members ? group.members.length : 0}</p>

            {group.members && group.members.length > 0 && (
              <ul>
                {group.members.map((member) => (
                  <li key={member._id || member}>
                    {member.name || member.email || "User"}
                  </li>
                ))}
              </ul>
            )}

            {!isOwner(group) && !isMember(group) && (
              <button onClick={() => joinGroup(group._id)}>
                Join Group
              </button>
            )}

            {!isOwner(group) && isMember(group) && (
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button disabled style={{ background: "gray", cursor: "default" }}>
                  Joined
                </button>

                <button onClick={() => leaveGroup(group._id)}>
                  Leave Group
                </button>
              </div>
            )}

            {isOwner(group) && (
              <>
                <button onClick={() => editGroup(group)}>Edit</button>

                <button
                  className="delete-btn"
                  onClick={() => deleteGroup(group._id)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Groups;