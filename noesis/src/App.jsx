import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Math from './pages/Math';
import Physics from './pages/Physics';
import Projectile from './pages/Projectile';
import Pendulum from './pages/Pendulum';
import Collision from './pages/Collision';
import PascalsLaw from './pages/PascalsLaw';
import ElectricField from './pages/ElectricField';
import MagneticField from './pages/MagneticField';
import FaradaysLaw from './pages/FaradaysLaw';
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
        <Route path="/electric-field" element={<ElectricField />} />
        <Route path="/magnetic-field" element={<MagneticField />} />
        <Route path="/faradays-law" element={<FaradaysLaw />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/examples" element={<Examples />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;

