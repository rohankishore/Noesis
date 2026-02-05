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
                <svg className="w-5 h-5 text-neutral-600 group-hover:text-neutral-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
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
                <svg className="w-5 h-5 text-neutral-600 group-hover:text-neutral-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
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
                <svg className="w-5 h-5 text-neutral-600 group-hover:text-neutral-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
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
                <svg className="w-5 h-5 text-neutral-600 group-hover:text-neutral-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2 text-neutral-100">Pascal's Law</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Interactive hydraulic press demonstrating pressure transmission and force multiplication in fluids.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Pressure</span>
                <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">Hydraulics</span>
              </div>
            </Link>

          </div>
        </main>
      </div>
    </div>
  );
}
