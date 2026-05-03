import { useEffect, useState } from "react";
import API from "../services/api";
import { io } from "socket.io-client";

const socket = io("https://study-group-finder-backend-vhao.onrender.com");

function Groups() {
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
      setGroups((old) => [...old, newGroup]);
    });

    socket.on("group-deleted", (id) => {
      setGroups((old) => old.filter((g) => g._id !== id));
    });

    socket.on("group-updated", (updatedGroup) => {
      setGroups((old) =>
        old.map((g) => (g._id === updatedGroup._id ? updatedGroup : g))
      );
    });

    return () => {
      socket.off("group-created");
      socket.off("group-deleted");
      socket.off("group-updated");
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
      setError("Failed to delete group.");
    }
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

            <button onClick={() => editGroup(group)}>Edit</button>

            <button
              className="delete-btn"
              onClick={() => deleteGroup(group._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Groups;