import { useEffect, useState } from "react";
import API from "../services/api";
import { io } from "socket.io-client";

const socket = io("http://localhost:4080");

function Resources() {
  const [resources, setResources] = useState([]);

  const [form, setForm] = useState({
    title: "",
    link: "",
    subject: ""
  });

  const loadResources = async () => {
    const res = await API.get("/resources");
    setResources(res.data);
  };

  useEffect(() => {
    loadResources();

    socket.on("resource-created", (newResource) => {
      setResources((oldResources) => [...oldResources, newResource]);
    });

    return () => {
      socket.off("resource-created");
    };
  }, []);

  const createResource = async (e) => {
    e.preventDefault();

    await API.post("/resources", form);

    setForm({
      title: "",
      link: "",
      subject: ""
    });
  };

  const deleteResource = async (id) => {
    await API.delete(`/resources/${id}`);
    loadResources();
  };

  return (
    <div>
      <div className="card">
        <h2>Add Resource</h2>

        <form onSubmit={createResource}>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            placeholder="Link"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />

          <input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />

          <button>Add Resource</button>
        </form>
      </div>

      <h2>Shared Resources</h2>

      <div className="grid">
        {resources.map((resource) => (
          <div className="card" key={resource._id}>
            <span className="badge">{resource.subject}</span>

            <h3>{resource.title}</h3>

            <a href={resource.link} target="_blank">
              Open Resource
            </a>

            <br />
            <br />

            <button
              className="delete-btn"
              onClick={() => deleteResource(resource._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Resources;