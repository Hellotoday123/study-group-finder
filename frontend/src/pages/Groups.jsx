import { useEffect, useState } from "react";
import API from "../services/api";
import { io } from "socket.io-client";

const socket = io("http://localhost:4080");

function Groups() {
  const [groups, setGroups] = useState([]);

  const [form, setForm] = useState({
    title: "",
    subject: "",
    description: "",
    meetingTime: "",
    location: ""
  });

  const loadGroups = async () => {
    const res = await API.get("/groups");
    setGroups(res.data);
  };

  useEffect(() => {
    loadGroups();

    socket.on("group-created", (newGroup) => {
      setGroups((oldGroups) => [...oldGroups, newGroup]);
    });

    socket.on("group-deleted", (id) => {
      setGroups((oldGroups) => oldGroups.filter((group) => group._id !== id));
    });

    return () => {
      socket.off("group-created");
      socket.off("group-deleted");
    };
  }, []);

  const createGroup = async (e) => {
    e.preventDefault();

    await API.post("/groups", form);

    setForm({
      title: "",
      subject: "",
      description: "",
      meetingTime: "",
      location: ""
    });
  };

  const deleteGroup = async (id) => {
    await API.delete(`/groups/${id}`);
  };

  return (
    <div>
      <div className="card">
        <h2>Create Study Group</h2>

        <form onSubmit={createGroup}>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />

          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            placeholder="Meeting Time"
            value={form.meetingTime}
            onChange={(e) => setForm({ ...form, meetingTime: e.target.value })}
          />

          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <button>Add Group</button>
        </form>
      </div>

      <h2>Available Study Groups</h2>

      <div className="grid">
        {groups.map((group) => (
          <div className="card" key={group._id}>
            <span className="badge">{group.subject}</span>

            <h3>{group.title}</h3>

            <p>{group.description}</p>

            <p>
              <strong>Time:</strong> {group.meetingTime}
            </p>

            <p>
              <strong>Location:</strong> {group.location}
            </p>

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