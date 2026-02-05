import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Math from './pages/Math';
import Physics from './pages/Physics';
import Projectile from './pages/Projectile';
import Pendulum from './pages/Pendulum';
import Collision from './pages/Collision';
import FluidDynamics from './pages/FluidDynamics';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/math" element={<Math />} />
        <Route path="/physics" element={<Physics />} />
        <Route path="/projectile" element={<Projectile />} />
        <Route path="/pendulum" element={<Pendulum />} />
        <Route path="/collision" element={<Collision />} />
        <Route path="/fluid-dynamics" element={<FluidDynamics />} />
      </Routes>
    </Router>
  );
}

export default App;

