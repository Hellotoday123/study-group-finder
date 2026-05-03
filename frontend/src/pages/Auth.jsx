import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const EyeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12C3 7 7 5 12 5s9 2 11 7c-2 5-6 7-11 7s-9-2-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 1l22 22" />
      <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
      <path d="M9.88 4.24A10.86 10.86 0 0 1 12 4c5 0 9 3 11 8a13.22 13.22 0 0 1-3.12 4.19" />
      <path d="M6.61 6.61A13.53 13.53 0 0 0 1 12c2 5 6 8 11 8a10.86 10.86 0 0 0 4.39-.89" />
    </svg>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

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

        setMessage("Account created. You can login now.");
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
      console.log(err.response?.data);

      setMessage(err.response?.data?.message || "Something went wrong");
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
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {!isLogin && (
            <div className="password-box">
              <input
                placeholder="Confirm Password"
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
              />

              <button
                type="button"
                className={`eye-btn ${showPassword ? "eye-visible" : ""}`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
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
              setMessageType("");
              setShowPassword(false);
              setForm({
                name: "",
                email: "",
                password: "",
                confirmPassword: ""
              });
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