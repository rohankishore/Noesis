import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';

export default function FluidDynamics() {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, down: false, button: 0 });
  
  const [gravity, setGravity] = useState(0.5);
  const [viscosity, setViscosity] = useState(0.95);
  const [particleCount, setParticleCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [spawnMode, setSpawnMode] = useState('water');
  const [showVelocity, setShowVelocity] = useState(false);
  const [stats, setStats] = useState({
    particles: 0,
    avgVelocity: 0,
    fps: 0
  });

  const canvasWidth = 900;
  const canvasHeight = 600;
  const particleRadius = 3;
  const smoothingRadius = 20;
  const targetDensity = 2.5;
  const pressureMultiplier = 0.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const updateCanvasSize = () => {
        const isMobile = window.innerWidth < 768;
        canvas.width = isMobile ? Math.min(window.innerWidth - 32, 600) : canvasWidth;
        canvas.height = isMobile ? 400 : canvasHeight;
        draw();
      };
      
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      return () => window.removeEventListener('resize', updateCanvasSize);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        down: true,
        button: e.button
      };
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseUp = () => {
      mouseRef.current.down = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, []);

  const start = () => {
    setIsRunning(true);
    particlesRef.current = [];
    setParticleCount(0);
    animate();
  };

  const spawnParticles = (x, y, count = 5) => {
    const particles = particlesRef.current;
    const canvas = canvasRef.current;
    
    const colors = {
      water: { r: 59, g: 130, b: 246, viscosity: 0.98 },
      oil: { r: 234, g: 179, b: 8, viscosity: 0.90 },
      honey: { r: 245, g: 158, b: 11, viscosity: 0.70 }
    };
    
    const color = colors[spawnMode];
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2;
      
      particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        density: 0,
        pressure: 0,
        color: color,
        type: spawnMode
      });
    }
    
    setParticleCount(particles.length);
  };

  const calculateDensity = (particle, neighbors) => {
    let density = 0;
    
    neighbors.forEach(neighbor => {
      const dx = neighbor.x - particle.x;
      const dy = neighbor.y - particle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < smoothingRadius) {
        const influence = 1 - (dist / smoothingRadius);
        density += influence * influence;
      }
    });
    
    return density;
  };

  const calculatePressure = (density) => {
    return (density - targetDensity) * pressureMultiplier;
  };

  const animate = () => {
    const frameStart = performance.now();
    const particles = particlesRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const mouse = mouseRef.current;
    if (mouse.down && isRunning) {
      if (mouse.button === 0) {
        spawnParticles(mouse.x, mouse.y, 3);
      }
    }
    
    const spatialGrid = new Map();
    const cellSize = smoothingRadius;
    
    particles.forEach(p => {
      const cellX = Math.floor(p.x / cellSize);
      const cellY = Math.floor(p.y / cellSize);
      const key = `${cellX},${cellY}`;
      
      if (!spatialGrid.has(key)) {
        spatialGrid.set(key, []);
      }
      spatialGrid.get(key).push(p);
    });
    
    particles.forEach(p => {
      const cellX = Math.floor(p.x / cellSize);
      const cellY = Math.floor(p.y / cellSize);
      const neighbors = [];
      
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const key = `${cellX + dx},${cellY + dy}`;
          if (spatialGrid.has(key)) {
            neighbors.push(...spatialGrid.get(key));
          }
        }
      }
      
      p.density = calculateDensity(p, neighbors);
      p.pressure = calculatePressure(p.density);
    });
    
    particles.forEach(p => {
      let pressureForceX = 0;
      let pressureForceY = 0;
      
      const cellX = Math.floor(p.x / cellSize);
      const cellY = Math.floor(p.y / cellSize);
      
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const key = `${cellX + dx},${cellY + dy}`;
          if (!spatialGrid.has(key)) continue;
          
          spatialGrid.get(key).forEach(neighbor => {
            if (neighbor === p) return;
            
            const dx = neighbor.x - p.x;
            const dy = neighbor.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < smoothingRadius && dist > 0) {
              const influence = 1 - (dist / smoothingRadius);
              const pressureGrad = (p.pressure + neighbor.pressure) / 2;
              
              pressureForceX -= (dx / dist) * pressureGrad * influence;
              pressureForceY -= (dy / dist) * pressureGrad * influence;
            }
          });
        }
      }
      
      p.vx += pressureForceX * 0.1;
      p.vy += pressureForceY * 0.1;
      
      p.vy += gravity;
      
      p.vx *= p.color.viscosity;
      p.vy *= p.color.viscosity;
      
      p.x += p.vx;
      p.y += p.vy;
      
      const damping = 0.5;
      if (p.x < particleRadius) {
        p.x = particleRadius;
        p.vx *= -damping;
      }
      if (p.x > canvas.width - particleRadius) {
        p.x = canvas.width - particleRadius;
        p.vx *= -damping;
      }
      if (p.y < particleRadius) {
        p.y = particleRadius;
        p.vy *= -damping;
      }
      if (p.y > canvas.height - particleRadius) {
        p.y = canvas.height - particleRadius;
        p.vy *= -damping;
      }
    });
    
    let totalVel = 0;
    particles.forEach(p => {
      totalVel += Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    });
    
    const frameEnd = performance.now();
    const frameDuration = frameEnd - frameStart;
    
    setStats({
      particles: particles.length,
      avgVelocity: particles.length > 0 ? (totalVel / particles.length).toFixed(2) : 0,
      fps: (1000 / Math.max(frameDuration, 1)).toFixed(0)
    });
    
    draw();
    
    if (isRunning) {
      animationIdRef.current = requestAnimationFrame(animate);
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
    
    const particles = particlesRef.current;
    
    particles.forEach(p => {
      const alpha = Math.min(1, p.density / targetDensity);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.8 + 0.2})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, particleRadius, 0, Math.PI * 2);
      ctx.fill();
      
      if (showVelocity) {
        const vel = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (vel > 0.1) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 2);
          ctx.stroke();
        }
      }
    });
    
    if (!isRunning && particlesRef.current.length === 0) {
      ctx.fillStyle = '#525252';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click "Start" then click and drag to spawn fluid particles', width / 2, height / 2);
    }
  };

  const reset = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    setIsRunning(false);
    particlesRef.current = [];
    setParticleCount(0);
    setStats({
      particles: 0,
      avgVelocity: 0,
      fps: 0
    });
    draw();
  };

  useEffect(() => {
    draw();
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <Header />
      
      <main className="pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Fluid Dynamics Simulator
            </h1>
            <p className="text-neutral-400">
              Interactive particle-based fluid simulation with pressure, viscosity, and surface tension
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6">
              <canvas
                ref={canvasRef}
                className="w-full border border-neutral-800 rounded-lg cursor-crosshair"
              />
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={start}
                  disabled={isRunning}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-neutral-700 disabled:to-neutral-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  {isRunning ? 'Running...' : 'Start'}
                </button>
                <button
                  onClick={reset}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  Reset
                </button>
              </div>
              
              <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg">
                <p className="text-sm text-neutral-300">
                  <span className="font-medium text-cyan-400">Click and drag</span> to spawn fluid particles. 
                  Choose different fluid types for varying viscosity and behavior.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-cyan-400">Fluid Type</h3>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-neutral-800/50 transition">
                    <input
                      type="radio"
                      name="fluid"
                      value="water"
                      checked={spawnMode === 'water'}
                      onChange={(e) => setSpawnMode(e.target.value)}
                      className="accent-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Water (Low viscosity)</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-neutral-800/50 transition">
                    <input
                      type="radio"
                      name="fluid"
                      value="oil"
                      checked={spawnMode === 'oil'}
                      onChange={(e) => setSpawnMode(e.target.value)}
                      className="accent-yellow-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Oil (Medium viscosity)</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-neutral-800/50 transition">
                    <input
                      type="radio"
                      name="fluid"
                      value="honey"
                      checked={spawnMode === 'honey'}
                      onChange={(e) => setSpawnMode(e.target.value)}
                      className="accent-orange-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                      <span className="text-sm">Honey (High viscosity)</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-cyan-400">Physics</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">
                      Gravity: <span className="text-cyan-400">{gravity.toFixed(2)}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={gravity}
                      onChange={(e) => setGravity(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-cyan-400">Display</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showVelocity}
                      onChange={(e) => setShowVelocity(e.target.checked)}
                      className="w-4 h-4 accent-cyan-500"
                    />
                    <span className="text-sm">Show Velocity Vectors</span>
                  </label>
                </div>
              </div>

              <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-cyan-400">Statistics</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Particles:</span>
                    <span className="font-mono">{stats.particles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Avg Velocity:</span>
                    <span className="font-mono">{stats.avgVelocity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">FPS:</span>
                    <span className="font-mono">{stats.fps}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-cyan-400">Physics Concepts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-300">
              <div>
                <h4 className="font-medium text-neutral-200 mb-1">Smoothed Particle Hydrodynamics (SPH)</h4>
                <p className="text-neutral-400">Particle-based method where fluid properties are calculated from neighboring particles</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-200 mb-1">Pressure Forces</h4>
                <p className="text-neutral-400">Particles push each other based on local density to simulate incompressibility</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-200 mb-1">Viscosity</h4>
                <p className="text-neutral-400">Internal friction that causes fluids to resist flow - honey flows slower than water</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-200 mb-1">Surface Tension</h4>
                <p className="text-neutral-400">Cohesive forces between particles create realistic fluid behavior at boundaries</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
