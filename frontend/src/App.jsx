import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Groups from "./pages/Groups";
import Resources from "./pages/Resources";
import ProtectedRoute from "./components/ProtectedRoute";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "15px",
        background: "#2f3437",
        color: "white",
        position: "relative"
      }}
    >
      <div style={{ display: "flex", gap: "20px" }}>
        <Link to="/home" style={{ color: "white", textDecoration: "none" }}>
          Study Group Finder
        </Link>

        {token && (
          <>
            <Link to="/groups" style={{ color: "white" }}>
              Study Groups
            </Link>
            <Link to="/resources" style={{ color: "white" }}>
              Resources
            </Link>
          </>
        )}
      </div>

      {token && (
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowConfirm(!showConfirm)}
            style={{
              background: "red",
              color: "white",
              border: "none",
              padding: "8px 15px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>

          {showConfirm && (
            <div
              style={{
                position: "absolute",
                top: "40px",
                right: "0",
                background: "white",
                color: "black",
                padding: "10px",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                zIndex: 10
              }}
            >
              <p style={{ marginBottom: "10px" }}>Are you sure?</p>

              <button
                onClick={handleLogout}
                style={{
                  marginRight: "10px",
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px"
                }}
              >
                Yes
              </button>

              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  background: "#ccc",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px"
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div className="container">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/home" element={<Home />} />

          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;