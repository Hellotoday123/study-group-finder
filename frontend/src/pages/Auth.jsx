import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // 👁️ ICONS
  const Eye = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
      <path d="M1 12C3 7 7 5 12 5s9 2 11 7c-2 5-6 7-11 7s-9-2-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOff = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
      <path d="M1 1l22 22" />
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C7 19 2.73 15.11 1 12c.73-1.34 1.67-2.6 2.8-3.72" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c5 0 9.27 3.89 11 7" />
    </svg>
  );

  // 🚀 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      if (!isLogin && form.password !== form.confirmPassword) {
        setMessage("Passwords do not match");
        setMessageType("error");
        return;
      }

      if (isLogin) {
        const res = await API.post("/auth/login", {
          email: form.email,
          password: form.password
        });

        localStorage.setItem("token", res.data.token);
        navigate("/groups");
      } else {
        await API.post("/auth/signup", {
          name: form.name,
          email: form.email,
          password: form.password
        });

        setMessage("Account created. Login now.");
        setMessageType("success");
        setIsLogin(true);
      }

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
      });

    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);

      setMessage(err.response?.data?.message || "Backend not responding");
      setMessageType("error");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">

        <h2>{isLogin ? "Login" : "Create Account"}</h2>

        {message && <p className={messageType}>{message}</p>}

        <form onSubmit={handleSubmit}>

          {!isLogin && (
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {/* PASSWORD */}
          <div className="password-box">
            <input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button
              type="button"
              className={`eye-btn ${showPassword ? "eye-visible" : ""}`}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          {!isLogin && (
            <div className="password-box">
              <input
                placeholder="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
              />

              <button
                type="button"
                className={`eye-btn ${showConfirmPassword ? "eye-visible" : ""}`}
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          )}

          <button>{isLogin ? "Login" : "Register"}</button>
        </form>

        <p className="switch-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
              setShowPassword(false);
              setShowConfirmPassword(false);
            }}
          >
            {isLogin ? "Register here" : "Login here"}
          </button>
        </p>

      </div>
    </div>
  );
}

export default Auth;