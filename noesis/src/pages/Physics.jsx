import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function Physics() {
  return (
    <div className="h-screen bg-neutral-950 text-neutral-200">
      <div className="flex flex-col h-full">
        <Header />

        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black p-8 pt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
            
            <Link to="/projectile" className="group block bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6 hover:border-neutral-600 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-800/50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400 font-medium">
                  Kinematics
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2 text-neutral-100">Projectile Motion</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Simulate parabolic trajectories with customizable velocity, angle, and air resistance. Visualize real-time physics calculations.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Kinematics</span>
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">2D Motion</span>
              </div>
            </Link>

            <Link to="/pendulum" className="group block bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6 hover:border-neutral-600 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-800/50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                  ⚖️
                </div>
                <div className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400 font-medium">
                  Energy
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2 text-neutral-100">Pendulum Simulator</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Explore simple harmonic motion with adjustable length, mass, and damping. Watch energy conservation in action.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">SHM</span>
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Energy</span>
              </div>
            </Link>

            <Link to="/collision" className="group block bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6 hover:border-neutral-600 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-800/50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-red-500 flex items-center justify-center text-2xl">
                  💥
                </div>
                <div className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400 font-medium">
                  Momentum
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2 text-neutral-100">Collision Lab</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Study elastic and inelastic collisions with conservation of momentum and energy. Visualize center of mass.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Momentum</span>
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Conservation</span>
              </div>
            </Link>

            <Link to="/pascals-law" className="group block bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6 hover:border-neutral-600 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-800/50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl">
                  ⚙️
                </div>
                <div className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-xs text-cyan-400 font-medium">
                  Fluids
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2 text-neutral-100">Pascal's Law</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Interactive hydraulic press demonstrating pressure transmission and force multiplication in fluids.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Pressure</span>
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Hydraulics</span>
              </div>
            </Link>

            <Link to="/magnetic-field" className="group block bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6 hover:border-neutral-600 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-800/50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-2xl">
                  🧲
                </div>
                <div className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400 font-medium">
                  Electromagnetism
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2 text-neutral-100">Magnetic Field</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Explore magnetic fields from wires, loops, and solenoids. Visualize field lines and compass behavior.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">B-Field</span>
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Current</span>
              </div>
            </Link>

            <Link to="/faradays-law" className="group block bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6 hover:border-neutral-600 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-800/50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl">
                  🔋
                </div>
                <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 font-medium">
                  Electromagnetism
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2 text-neutral-100">Faraday's Law</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Move a magnet through a coil and generate electric current. See electromagnetic induction in action.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Induction</span>
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">EMF</span>
              </div>
            </Link>

            <Link to="/refraction" className="group block bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6 hover:border-neutral-600 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-800/50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl">
                  🔦
                </div>
                <div className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-xs text-cyan-400 font-medium">
                  Optics
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2 text-neutral-100">Refraction</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Watch light bend through different materials. Adjust angle and see total internal reflection.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Snell's Law</span>
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Light</span>
              </div>
            </Link>

            <Link to="/lens-simulator" className="group block bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6 hover:border-neutral-600 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-800/50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-2xl">
                  🔍
                </div>
                <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400 font-medium">
                  Optics
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2 text-neutral-100">Lens Simulator</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Ray tracing through convex and concave lenses. Visualize real and virtual images.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Ray Tracing</span>
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Lenses</span>
              </div>
            </Link>

            <Link to="/prism" className="group block bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6 hover:border-neutral-600 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-800/50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-2xl">
                  🌈
                </div>
                <div className="px-2 py-1 bg-pink-500/20 border border-pink-500/30 rounded text-xs text-pink-400 font-medium">
                  Optics
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2 text-neutral-100">Prism Dispersion</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">White light splitting into rainbow spectrum. See wavelength-dependent refraction.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Dispersion</span>
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Spectrum</span>
              </div>
            </Link>

          </div>
        </main>
      </div>
    </div>
  );
}
