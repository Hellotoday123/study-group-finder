import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to Study Group Finder</h1>
      <p>Find or create study groups and share resources with classmates.</p>

      <div style={{ marginTop: "30px" }}>
        <Link to="/groups">
          <button style={{ marginRight: "15px", padding: "10px 20px" }}>
            Go to Study Groups
          </button>
        </Link>

        <Link to="/resources">
          <button style={{ padding: "10px 20px" }}>
            View Resources
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Home;