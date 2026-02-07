import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Math from './pages/MathNew';
import Physics from './pages/Physics';
import Projectile from './pages/Projectile';
import Pendulum from './pages/Pendulum';
import Collision from './pages/Collision';
import PascalsLaw from './pages/PascalsLaw';
import MagneticField from './pages/MagneticField';
import FaradaysLaw from './pages/FaradaysLaw';
import Refraction from './pages/Refraction';
import LensSimulator from './pages/LensSimulator';
import Prism from './pages/Prism';
import Documentation from './pages/Documentation';
import Examples from './pages/Examples';
import About from './pages/About';
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
        <Route path="/pascals-law" element={<PascalsLaw />} />
        <Route path="/magnetic-field" element={<MagneticField />} />
        <Route path="/faradays-law" element={<FaradaysLaw />} />
        <Route path="/refraction" element={<Refraction />} />
        <Route path="/lens-simulator" element={<LensSimulator />} />
        <Route path="/prism" element={<Prism />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/examples" element={<Examples />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;

