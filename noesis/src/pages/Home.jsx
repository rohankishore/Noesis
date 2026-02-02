import { Link } from 'react-router-dom';
import Header from '../components/Header';
import DarkVeil from '@/component/DarkVeil';
import GradientText from '@/component/GradientText';

export default function Home() {
  return (
    <div className="min-h-screen text-white relative">
      {/* Dark Veil Background */}
      <div className="fixed inset-0 z-0">
        <DarkVeil />
      </div>
      
      <div className="flex flex-col min-h-screen relative z-10">
        <Header />
        
        <main className="flex flex-1 items-center justify-center px-8 pt-32 pb-16">
          <div className="text-center space-y-16 max-w-6xl w-full">
            <div className="space-y-6">
              <h2 className="text-7xl title-font font-bold tracking-tight">
                <GradientText colors={['#667eea', '#764ba2', '#FF6B9D']}>
                  Welcome to Noesis
                </GradientText>
              </h2>
              <p className="text-white/60 text-xl font-light tracking-wide">Explore the beauty of mathematics and physics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
              
              <Link to="/math" className="group glass glass-hover shimmer card-glow-blue rounded-3xl p-10 transition-all duration-500">
                <div className="flex flex-col items-center text-center space-y-8">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl shadow-2xl glow group-hover:scale-110 transition-transform duration-500">
                    ∑
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-semibold text-white title-font">Mathematics</h3>
                    <p className="text-white/60 leading-relaxed font-light">Explore mathematical concepts, visualizations, and interactive tools for learning and discovery.</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 pt-4">
                    <span className="text-xs px-4 py-2 rounded-full glass text-white/80 font-medium tracking-wide">Calculus</span>
                    <span className="text-xs px-4 py-2 rounded-full glass text-white/80 font-medium tracking-wide">Algebra</span>
                    <span className="text-xs px-4 py-2 rounded-full glass text-white/80 font-medium tracking-wide">Geometry</span>
                  </div>
                </div>
              </Link>

              <Link to="/physics" className="group glass glass-hover shimmer card-glow-purple rounded-3xl p-10 transition-all duration-500">
                <div className="flex flex-col items-center text-center space-y-8">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-5xl shadow-2xl glow group-hover:scale-110 transition-transform duration-500">
                    ⚡
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-semibold text-white title-font">Physics</h3>
                    <p className="text-white/60 leading-relaxed font-light">Simulate physical systems, analyze motion, and understand the fundamental laws governing our universe.</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 pt-4">
                    <span className="text-xs px-4 py-2 rounded-full glass text-white/80 font-medium tracking-wide">Mechanics</span>
                    <span className="text-xs px-4 py-2 rounded-full glass text-white/80 font-medium tracking-wide">Kinematics</span>
                    <span className="text-xs px-4 py-2 rounded-full glass text-white/80 font-medium tracking-wide">Energy</span>
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
