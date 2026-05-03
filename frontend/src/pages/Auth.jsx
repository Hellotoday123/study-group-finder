import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let res;

      if (isLogin) {
        res = await API.post("/auth/login", {
          email: form.email,
          password: form.password
        });
      } else {
        res = await API.post("/auth/register", form);
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="card">
      <h2>{isLogin ? "Login" : "Register"}</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />
        )}

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <button>{isLogin ? "Login" : "Register"}</button>
      </form>

      <p>
        {isLogin ? "No account?" : "Already have an account?"}{" "}
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}

export default Auth;