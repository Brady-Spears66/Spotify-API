import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TopTracks from "./pages/TopTracks";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/top-tracks" element={<TopTracks />} />
    </Routes>
  </Router>
);

export default App;
