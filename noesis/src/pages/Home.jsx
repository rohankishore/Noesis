import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import DarkVeil from '@/component/DarkVeil';
import GlitchText from '../components/GlitchText';
import TargetCursor from '@/component/TargetCursor';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: '🎯', title: 'Projectile Motion', category: 'Kinematics', link: '/projectile' },
    { icon: '⚖️', title: 'Pendulum', category: 'Energy', link: '/pendulum' },
    { icon: '💥', title: 'Collision Lab', category: 'Momentum', link: '/collision' },
    { icon: '⚙️', title: "Pascal's Law", category: 'Fluids', link: '/pascals-law' }
  ];

  return (
    <div className="min-h-screen text-white dark:text-white bg-white dark:bg-transparent relative overflow-hidden">
      <TargetCursor targetSelector=".cursor-target" />
      
      <div className="fixed inset-0 z-0 dark:block hidden">
        <DarkVeil />
      </div>

      <div className="fixed inset-0 z-0 dark:hidden block bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />

      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${
            document.documentElement.classList.contains('dark') 
              ? 'rgba(102, 126, 234, 0.15)' 
              : 'rgba(102, 126, 234, 0.08)'
          }, transparent 40%)`
        }}
      />
      
      <div className="flex flex-col min-h-screen relative z-10">
        <Header />
        
        <main className="flex flex-1 items-center justify-center px-8 pt-32 pb-16">
          <div className="text-center space-y-20 max-w-7xl w-full">
            <div className="space-y-8">
              <div className="inline-block mb-4">
                <div className="px-4 py-2 rounded-full glass border border-white/10 text-sm text-white/80 tracking-wider">
                  Interactive Physics & Math Platform
                </div>
              </div>
              
              <h1 className="text-8xl md:text-9xl font-bold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <GlitchText text="Noesis" className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-100" />
              </h1>
              
              <p className="text-white/70 text-2xl font-light tracking-wide max-w-3xl mx-auto leading-relaxed">
                Explore the universe through <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-medium">interactive simulations</span> and 
                discover the beauty of physics in real-time
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-6">
                <Link to="/math" className="cursor-target group relative px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 hover:scale-105">
                  <span className="relative z-10 font-semibold text-lg flex items-center gap-2">
                    Graphing Calculator
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </span>
                </Link>

                <Link to="/physics" className="cursor-target group relative px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 hover:scale-105">
                  <span className="relative z-10 font-semibold text-lg flex items-center gap-2">
                    Physics Simulations
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </span>
                </Link>
                
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <Link
                  key={idx}
                  to={feature.link}
                  className="cursor-target group glass glass-hover rounded-2xl p-6 transition-all duration-500 hover:scale-105 border border-white/10 hover:border-white/30"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`
                  }}
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/60">{feature.category}</p>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Link to="/math" className="cursor-target group glass glass-hover rounded-3xl p-10 transition-all duration-500 border border-white/10 hover:border-blue-500/50">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    ∑
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-semibold text-white title-font">Mathematics</h3>
                    <p className="text-white/60 leading-relaxed font-light">Explore mathematical concepts, visualizations, and interactive tools for learning and discovery.</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 pt-4">
                    <span className="text-xs px-3 py-1.5 rounded-full glass text-white/80 font-medium">Calculus</span>
                    <span className="text-xs px-3 py-1.5 rounded-full glass text-white/80 font-medium">Algebra</span>
                    <span className="text-xs px-3 py-1.5 rounded-full glass text-white/80 font-medium">Geometry</span>
                  </div>
                </div>
              </Link>

              <Link to="/physics" className="cursor-target group glass glass-hover rounded-3xl p-10 transition-all duration-500 border border-white/10 hover:border-purple-500/50">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-5xl shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                    ⚡
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-semibold text-white title-font">Physics</h3>
                    <p className="text-white/60 leading-relaxed font-light">Simulate physical systems, analyze motion, and understand the fundamental laws governing our universe.</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 pt-4">
                    <span className="text-xs px-3 py-1.5 rounded-full glass text-white/80 font-medium">Kinematics</span>
                    <span className="text-xs px-3 py-1.5 rounded-full glass text-white/80 font-medium">Energy</span>
                    <span className="text-xs px-3 py-1.5 rounded-full glass text-white/80 font-medium">Momentum</span>
                    <span className="text-xs px-3 py-1.5 rounded-full glass text-white/80 font-medium">Fluids</span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="glass rounded-3xl p-8 border border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-left">
                  <h3 className="text-2xl font-bold mb-2">Ready to learn?</h3>
                  <p className="text-white/60">Check out our examples and documentation to get started</p>
                </div>
                <div className="flex gap-4">
                  <Link to="/examples" className="cursor-target px-6 py-3 rounded-xl glass glass-hover border border-white/20 hover:border-white/40 transition-all font-medium">
                    View Examples
                  </Link>
                  <Link to="/about" className="cursor-target px-6 py-3 rounded-xl glass glass-hover border border-white/20 hover:border-white/40 transition-all font-medium">
                    About Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
