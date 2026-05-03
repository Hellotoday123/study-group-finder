import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Groups from "./pages/Groups";
import Resources from "./pages/Resources";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/auth">Study Group Finder</Link>
        <Link to="/auth">Login</Link>
        <Link to="/groups">Study Groups</Link>
        <Link to="/resources">Resources</Link>
      </nav>

      <div className="container">
        <Routes>
          {/* 👇 THIS makes Auth the first page */}
          <Route path="/" element={<Auth />} />

          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/resources" element={<Resources />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;