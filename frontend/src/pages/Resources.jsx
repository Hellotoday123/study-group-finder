import { useEffect, useState } from "react";
import API from "../services/api";
import { io } from "socket.io-client";

const socket = io("https://study-group-finder-backend-vhao.onrender.com");

function Resources() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [resources, setResources] = useState([]);

  const [form, setForm] = useState({
    title: "",
    link: "",
    subject: ""
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const loadResources = async () => {
    try {
      const res = await API.get("/resources");
      setResources(res.data);
    } catch (err) {
      setError("Failed to load resources.");
    }
  };

  useEffect(() => {
    loadResources();

    socket.on("resource-created", (newResource) => {
      setResources((old) => [newResource, ...old]);
    });

    socket.on("resource-updated", (updatedResource) => {
      setResources((old) =>
        old.map((resource) =>
          resource._id === updatedResource._id ? updatedResource : resource
        )
      );
    });

    socket.on("resource-deleted", (id) => {
      setResources((old) =>
        old.filter((resource) => resource._id !== id)
      );
    });

    return () => {
      socket.off("resource-created");
      socket.off("resource-updated");
      socket.off("resource-deleted");
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      title: "",
      link: "",
      subject: ""
    });

    setEditingId(null);
  };

  const createOrUpdateResource = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title || !form.link || !form.subject) {
      setError("Please fill in all fields.");
      return;
    }

    if (!form.link.startsWith("http://") && !form.link.startsWith("https://")) {
      setError("Please enter a valid link starting with http:// or https://");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await API.put(`/resources/${editingId}`, form);
        setSuccess("Resource updated successfully.");
      } else {
        await API.post("/resources", form);
        setSuccess("Resource added successfully.");
      }

      resetForm();
      loadResources();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const editResource = (resource) => {
    setEditingId(resource._id);

    setForm({
      title: resource.title,
      link: resource.link,
      subject: resource.subject
    });

    setError("");
    setSuccess("");
  };

  const deleteResource = async (id) => {
    setError("");
    setSuccess("");

    try {
      await API.delete(`/resources/${id}`);
      setSuccess("Resource deleted successfully.");
      loadResources();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete resource.");
    }
  };

  const isOwner = (resource) => {
    return (
      resource.createdBy?._id === user?._id ||
      resource.createdBy === user?._id
    );
  };

  return (
    <div>
      <div className="card">
        <h2>{editingId ? "Edit Resource" : "Add Resource"}</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form onSubmit={createOrUpdateResource}>
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
          />

          <input
            name="link"
            placeholder="Link"
            value={form.link}
            onChange={handleChange}
          />

          <input
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
          />

          <button disabled={loading}>
            {loading
              ? "Saving..."
              : editingId
              ? "Update Resource"
              : "Add Resource"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <h2>Shared Resources</h2>

      <div className="grid">
        {resources.map((resource) => (
          <div className="card" key={resource._id}>
            <span className="badge">{resource.subject}</span>

            <h3>{resource.title}</h3>

            <a href={resource.link} target="_blank" rel="noreferrer">
              Open Resource
            </a>

            {resource.createdBy && (
              <p>
                Created by:{" "}
                {resource.createdBy.name || resource.createdBy.email || "User"}
              </p>
            )}

            {isOwner(resource) && (
              <>
                <button onClick={() => editResource(resource)}>Edit</button>

                <button
                  className="delete-btn"
                  onClick={() => deleteResource(resource._id)}
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

export default Resources;