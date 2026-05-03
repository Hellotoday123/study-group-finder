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

  const loadGroups = async () => {
    const res = await API.get("/groups");
    setGroups(res.data);
  };

  useEffect(() => {
    loadGroups();

    socket.on("group-created", (newGroup) => {
      setGroups((old) => [...old, newGroup]);
    });

    socket.on("group-deleted", (id) => {
      setGroups((old) => old.filter((g) => g._id !== id));
    });

    return () => {
      socket.off("group-created");
      socket.off("group-deleted");
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createGroup = async (e) => {
    e.preventDefault();
    await API.post("/groups", form);

    setForm({
      title: "",
      subject: "",
      description: "",
      meetingTime: ""
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

            <p>{new Date(group.meetingTime).toLocaleString()}</p>

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

const [message, setMessage] = useState("");
const [messages, setMessages] = useState([]);

useEffect(() => {
  socket.on("new-message", (msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  return () => socket.off("new-message");
}, []);

export default Groups;