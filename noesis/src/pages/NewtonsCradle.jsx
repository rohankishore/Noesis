import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';

export default function NewtonsCradle() {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const ballsRef = useRef([]);
  
  const [numBalls, setNumBalls] = useState(5);
  const [pullAngle, setPullAngle] = useState(30);
  const [numPulled, setNumPulled] = useState(1);
  const [damping, setDamping] = useState(0.002);
  const [gravity, setGravity] = useState(9.81);
  const [isRunning, setIsRunning] = useState(false);
  const [showVectors, setShowVectors] = useState(false);
  const [showEnergy, setShowEnergy] = useState(true);
  const [stats, setStats] = useState({
    totalMomentum: 0,
    totalEnergy: 0,
    maxAngle: 0
  });

  const canvasWidth = 900;
  const canvasHeight = 600;
  const ballRadius = 25;
  const ballMass = 10;
  const stringLength = 200;
  const originY = 100;
  const spacing = ballRadius * 2 + 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const updateCanvasSize = () => {
        const isMobile = window.innerWidth < 768;
        canvas.width = isMobile ? Math.min(window.innerWidth - 32, 600) : canvasWidth;
        canvas.height = isMobile ? 400 : canvasHeight;
        if (!isRunning) initializeBalls();
        draw();
      };
      
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      return () => window.removeEventListener('resize', updateCanvasSize);
    }
  }, []);

  const initializeBalls = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const centerX = canvas.width / 2;
    const startX = centerX - ((numBalls - 1) * spacing) / 2;
    
    const balls = [];
    for (let i = 0; i < numBalls; i++) {
      const angle = i < numPulled ? pullAngle * Math.PI / 180 : 0;
      balls.push({
        angle: angle,
        angularVelocity: 0,
        x: startX + i * spacing,
        mass: ballMass,
        radius: ballRadius,
        length: stringLength
      });
    }
    ballsRef.current = balls;
  };

  const start = () => {
    setIsRunning(true);
    initializeBalls();
    animate();
  };

  const animate = () => {
    const dt = 0.016;
    const balls = ballsRef.current;
    const g = gravity;
    
    balls.forEach((ball, i) => {
      const angularAccel = -(g / ball.length) * Math.sin(ball.angle) - damping * ball.angularVelocity;
      ball.angularVelocity += angularAccel * dt;
      ball.angle += ball.angularVelocity * dt;
    });
    
    const threshold = 0.01;
    
    for (let i = 0; i < balls.length - 1; i++) {
      const ball1 = balls[i];
      const ball2 = balls[i + 1];
      
      const x1 = ball1.x + ball1.length * Math.sin(ball1.angle);
      const x2 = ball2.x + ball2.length * Math.sin(ball2.angle);
      
      const distance = Math.abs(x2 - x1);
      const minDist = ball1.radius + ball2.radius;
      
      if (distance <= minDist + 2) {
        const v1 = ball1.angularVelocity * ball1.length;
        const v2 = ball2.angularVelocity * ball2.length;
        
        const relVel = v1 - v2;
        
        if ((relVel > threshold && ball1.angle > ball2.angle) || 
            (relVel < -threshold && ball1.angle < ball2.angle)) {
          
          if (Math.abs(ball2.angle) < threshold && Math.abs(v2) < threshold) {
            let lastMoving = i + 1;
            while (lastMoving < balls.length - 1 && 
                   Math.abs(balls[lastMoving].angle) < threshold && 
                   Math.abs(balls[lastMoving].angularVelocity * balls[lastMoving].length) < threshold) {
              lastMoving++;
            }
            
            if (lastMoving < balls.length) {
              balls[lastMoving].angularVelocity = ball1.angularVelocity;
              ball1.angularVelocity = 0;
              ball1.angle = 0;
              
              for (let j = i + 1; j < lastMoving; j++) {
                balls[j].angle = 0;
                balls[j].angularVelocity = 0;
              }
            }
          } else {
            const m1 = ball1.mass;
            const m2 = ball2.mass;
            
            const v1Final = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
            const v2Final = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
            
            ball1.angularVelocity = v1Final / ball1.length;
            ball2.angularVelocity = v2Final / ball2.length;
          }
        }
      }
    }
    
    updateStats();
    draw();
    animationIdRef.current = requestAnimationFrame(animate);
  };

  const updateStats = () => {
    const balls = ballsRef.current;
    let totalMomentum = 0;
    let totalEnergy = 0;
    let maxAngle = 0;
    
    balls.forEach(ball => {
      const velocity = ball.angularVelocity * ball.length;
      totalMomentum += ball.mass * velocity;
      
      const ke = 0.5 * ball.mass * Math.pow(velocity, 2);
      const pe = ball.mass * gravity * ball.length * (1 - Math.cos(ball.angle));
      totalEnergy += ke + pe;
      
      maxAngle = Math.max(maxAngle, Math.abs(ball.angle * 180 / Math.PI));
    });
    
    setStats({
      totalMomentum: totalMomentum.toFixed(2),
      totalEnergy: totalEnergy.toFixed(2),
      maxAngle: maxAngle.toFixed(1)
    });
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
    
    const centerX = width / 2;
    const frameWidth = (numBalls - 1) * spacing + ballRadius * 4;
    const frameLeft = centerX - frameWidth / 2;
    const frameRight = centerX + frameWidth / 2;
    
    ctx.strokeStyle = '#525252';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(frameLeft, originY - 20);
    ctx.lineTo(frameLeft, originY);
    ctx.lineTo(frameRight, originY);
    ctx.lineTo(frameRight, originY - 20);
    ctx.stroke();
    
    const balls = ballsRef.current;
    balls.forEach((ball, index) => {
      const ballX = ball.x + ball.length * Math.sin(ball.angle);
      const ballY = originY + ball.length * Math.cos(ball.angle);
      
      ctx.strokeStyle = '#404040';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ball.x, originY);
      ctx.lineTo(ballX, ballY);
      ctx.stroke();
      
      const gradient = ctx.createRadialGradient(ballX - 8, ballY - 8, 5, ballX, ballY, ball.radius);
      gradient.addColorStop(0, '#e5e5e5');
      gradient.addColorStop(1, '#737373');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(ballX, ballY, ball.radius, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#262626';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      if (showVectors && Math.abs(ball.angularVelocity) > 0.01) {
        const velocity = ball.angularVelocity * ball.length;
        const vectorLength = Math.abs(velocity) * 5;
        const vx = velocity * Math.cos(ball.angle) * 5;
        const vy = -velocity * Math.sin(ball.angle) * 5;
        
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ballX, ballY);
        ctx.lineTo(ballX + vx, ballY + vy);
        ctx.stroke();
        
        const angle = Math.atan2(vy, vx);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(ballX + vx, ballY + vy);
        ctx.lineTo(ballX + vx - 10 * Math.cos(angle - Math.PI / 6), ballY + vy - 10 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(ballX + vx - 10 * Math.cos(angle + Math.PI / 6), ballY + vy - 10 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      }
      
      if (showEnergy) {
        const velocity = ball.angularVelocity * ball.length;
        const ke = 0.5 * ball.mass * Math.pow(velocity, 2);
        const pe = ball.mass * gravity * ball.length * (1 - Math.cos(ball.angle));
        const totalE = ke + pe;
        
        const barHeight = totalE * 0.5;
        const barX = ball.x;
        const barY = height - 60;
        const barWidth = spacing * 0.6;
        
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(barX - barWidth / 2, barY - barHeight * (ke / totalE), barWidth, barHeight * (ke / totalE));
        
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(barX - barWidth / 2, barY - barHeight, barWidth, barHeight * (pe / totalE));
        
        ctx.strokeStyle = '#525252';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX - barWidth / 2, barY - barHeight, barWidth, barHeight);
      }
    });
  };

  const reset = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    setIsRunning(false);
    initializeBalls();
    setStats({
      totalMomentum: 0,
      totalEnergy: 0,
      maxAngle: 0
    });
    draw();
  };

  useEffect(() => {
    if (!isRunning) {
      initializeBalls();
      draw();
    }
  }, [numBalls, pullAngle, numPulled, showVectors, showEnergy]);

  useEffect(() => {
    initializeBalls();
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-gray-400 to-slate-300 bg-clip-text text-transparent">
              Newton's Cradle
            </h1>
            <p className="text-neutral-400">
              Demonstrate conservation of momentum and energy through elastic collisions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6">
              <canvas
                ref={canvasRef}
                className="w-full border border-neutral-800 rounded-lg"
              />
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={start}
                  disabled={isRunning}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 disabled:from-neutral-700 disabled:to-neutral-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition"
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
            </div>

            <div className="space-y-4">
              <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-400">Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">
                      Number of Balls: <span className="text-gray-400">{numBalls}</span>
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="7"
                      value={numBalls}
                      onChange={(e) => setNumBalls(Number(e.target.value))}
                      disabled={isRunning}
                      className="w-full accent-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Pull Angle: <span className="text-gray-400">{pullAngle}°</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={pullAngle}
                      onChange={(e) => setPullAngle(Number(e.target.value))}
                      disabled={isRunning}
                      className="w-full accent-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Balls to Pull: <span className="text-gray-400">{numPulled}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max={Math.min(3, numBalls - 1)}
                      value={numPulled}
                      onChange={(e) => setNumPulled(Number(e.target.value))}
                      disabled={isRunning}
                      className="w-full accent-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Gravity: <span className="text-gray-400">{gravity} m/s²</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.1"
                      value={gravity}
                      onChange={(e) => setGravity(Number(e.target.value))}
                      disabled={isRunning}
                      className="w-full accent-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Damping: <span className="text-gray-400">{damping.toFixed(3)}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="0.05"
                      step="0.001"
                      value={damping}
                      onChange={(e) => setDamping(Number(e.target.value))}
                      disabled={isRunning}
                      className="w-full accent-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-400">Display</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showVectors}
                      onChange={(e) => setShowVectors(e.target.checked)}
                      className="w-4 h-4 accent-gray-500"
                    />
                    <span className="text-sm">Show Velocity Vectors</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showEnergy}
                      onChange={(e) => setShowEnergy(e.target.checked)}
                      className="w-4 h-4 accent-gray-500"
                    />
                    <span className="text-sm">Show Energy Bars</span>
                  </label>
                </div>
              </div>

              <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-400">Statistics</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Total Momentum:</span>
                    <span className="font-mono">{stats.totalMomentum} kg⋅m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Total Energy:</span>
                    <span className="font-mono">{stats.totalEnergy} J</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Max Angle:</span>
                    <span className="font-mono">{stats.maxAngle}°</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-400">Physics Concepts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-300">
              <div>
                <h4 className="font-medium text-neutral-200 mb-1">Conservation of Momentum</h4>
                <p className="text-neutral-400">When one ball strikes the others, momentum transfers through the stationary balls to the last ball</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-200 mb-1">Elastic Collisions</h4>
                <p className="text-neutral-400">Both kinetic energy and momentum are conserved in the steel ball collisions</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-200 mb-1">Energy Transfer</h4>
                <p className="text-neutral-400">Potential energy at maximum height converts to kinetic energy at the bottom of the swing</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-200 mb-1">Symmetry</h4>
                <p className="text-neutral-400">The number of balls pulled back equals the number that swing out on the opposite side</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
