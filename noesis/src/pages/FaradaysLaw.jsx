import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';

export default function FaradaysLaw() {
  const canvasRef = useRef(null);
  const [magnetPos, setMagnetPos] = useState(200);
  const [velocity, setVelocity] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [emf, setEmf] = useState(0);
  const [current, setCurrent] = useState(0);
  const [flux, setFlux] = useState(0);
  const [showField, setShowField] = useState(true);
  const lastPosRef = useRef(200);
  const lastTimeRef = useRef(Date.now());

  const coilCenter = 400;
  const coilRadius = 80;

  useEffect(() => {
    if (!isDragging) {
      const interval = setInterval(() => {
        const now = Date.now();
        const dt = (now - lastTimeRef.current) / 1000;
        
        const newVelocity = velocity * 0.95;
        setVelocity(newVelocity);
        
        const newPos = magnetPos + newVelocity * dt * 100;
        setMagnetPos(Math.max(50, Math.min(750, newPos)));
        
        lastTimeRef.current = now;
      }, 16);
      
      return () => clearInterval(interval);
    }
  }, [magnetPos, velocity, isDragging]);

  useEffect(() => {
    const distance = Math.abs(magnetPos - coilCenter);
    const maxFlux = 10;
    const currentFlux = maxFlux * Math.exp(-distance / 100);
    setFlux(currentFlux);

    const calculatedEmf = -velocity * 0.5;
    setEmf(calculatedEmf);
    setCurrent(calculatedEmf * 0.1);
  }, [magnetPos, velocity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const animate = () => {
      ctx.fillStyle = '#0f0f1e';
      ctx.fillRect(0, 0, width, height);

      if (showField) {
        drawMagneticField(ctx);
      }

      drawCoil(ctx, width, height);
      drawMagnet(ctx, height);
      drawCurrentIndicator(ctx, height);

      requestAnimationFrame(animate);
    };

    animate();
  }, [magnetPos, current, showField]);

  const drawMagneticField = (ctx) => {
    const numLines = 16;
    
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const startRadius = 25;
      const endRadius = 150;
      
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.4)';
      ctx.lineWidth = 2;
      
      for (let r = startRadius; r < endRadius; r += 10) {
        const x1 = magnetPos + r * Math.cos(angle);
        const y1 = 300 + r * Math.sin(angle);
        const x2 = magnetPos + (r + 8) * Math.cos(angle);
        const y2 = 300 + (r + 8) * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  };

  const drawCoil = (ctx, width, height) => {
    const coilY = height / 2;
    const turns = 10;
    
    for (let i = 0; i < turns; i++) {
      const offset = (i - turns / 2) * 8;
      
      ctx.strokeStyle = '#ffa500';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(coilCenter + offset, coilY, coilRadius, Math.PI / 2, -Math.PI / 2, true);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(coilCenter + offset, coilY, coilRadius, -Math.PI / 2, Math.PI / 2, true);
      ctx.stroke();
    }

    ctx.strokeStyle = '#ffa500';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(coilCenter - 50, coilY - coilRadius);
    ctx.lineTo(coilCenter - 50, coilY - coilRadius - 80);
    ctx.lineTo(coilCenter + 50, coilY - coilRadius - 80);
    ctx.lineTo(coilCenter + 50, coilY - coilRadius);
    ctx.stroke();

    const resistance = 100;
    ctx.fillStyle = 'white';
    ctx.fillRect(coilCenter - 40, coilY - coilRadius - 100, 80, 30);
    ctx.fillStyle = '#0f0f1e';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`R = ${resistance}Ω`, coilCenter, coilY - coilRadius - 80);

    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText('Coil', coilCenter, coilY + coilRadius + 25);
  };

  const drawMagnet = (ctx, height) => {
    const magnetHeight = 60;
    const magnetWidth = 40;
    const y = height / 2 - magnetHeight / 2;

    const gradient = ctx.createLinearGradient(magnetPos - magnetWidth / 2, y, magnetPos + magnetWidth / 2, y);
    gradient.addColorStop(0, '#ff4444');
    gradient.addColorStop(0.5, '#cccccc');
    gradient.addColorStop(1, '#4444ff');

    ctx.fillStyle = gradient;
    ctx.fillRect(magnetPos - magnetWidth / 2, y, magnetWidth, magnetHeight);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(magnetPos - magnetWidth / 2, y, magnetWidth, magnetHeight);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('N', magnetPos - magnetWidth / 4, y + magnetHeight / 2 + 7);
    ctx.fillText('S', magnetPos + magnetWidth / 4, y + magnetHeight / 2 + 7);

    if (Math.abs(velocity) > 0.1) {
      const arrow = velocity > 0 ? '→' : '←';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(arrow, magnetPos, y - 15);
    }
  };

  const drawCurrentIndicator = (ctx, height) => {
    const direction = current > 0 ? '↑' : current < 0 ? '↓' : '○';
    const color = current > 0 ? '#00ff00' : current < 0 ? '#ff0000' : '#888888';
    
    ctx.fillStyle = color;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(direction, coilCenter + 150, height / 2);
    
    ctx.font = '14px Arial';
    ctx.fillText('Current', coilCenter + 150, height / 2 + 30);
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    if (Math.abs(x - magnetPos) < 30) {
      setIsDragging(true);
      lastPosRef.current = magnetPos;
      lastTimeRef.current = Date.now();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    const now = Date.now();
    const dt = (now - lastTimeRef.current) / 1000;
    
    if (dt > 0) {
      const newVelocity = (x - lastPosRef.current) / dt;
      setVelocity(newVelocity);
    }
    
    setMagnetPos(Math.max(50, Math.min(750, x)));
    lastPosRef.current = x;
    lastTimeRef.current = now;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const reset = () => {
    setMagnetPos(200);
    setVelocity(0);
    setEmf(0);
    setCurrent(0);
  };

  const pushMagnet = (direction) => {
    setVelocity(direction * 200);
  };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)' }}>
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Faraday's Law</h1>
            <p className="text-white/60">Moving magnet induces current in a coil</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="glass rounded-2xl p-6 border border-white/10">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full rounded-lg cursor-grab active:cursor-grabbing"
                  style={{ background: '#0f0f1e' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="glass rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-white/60 mb-1">Magnetic Flux</div>
                  <div className="text-2xl font-bold">{flux.toFixed(2)} Wb</div>
                </div>
                <div className="glass rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-white/60 mb-1">Induced EMF</div>
                  <div className="text-2xl font-bold">{emf.toFixed(2)} V</div>
                </div>
                <div className="glass rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-white/60 mb-1">Current</div>
                  <div className="text-2xl font-bold">{current.toFixed(3)} A</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Controls</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showField}
                        onChange={(e) => setShowField(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Show Magnetic Field</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => pushMagnet(1)}
                      className="w-full px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 transition-colors"
                    >
                      Push Right →
                    </button>
                    <button
                      onClick={() => pushMagnet(-1)}
                      className="w-full px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 transition-colors"
                    >
                      ← Push Left
                    </button>
                    <button
                      onClick={reset}
                      className="w-full px-4 py-2 rounded-lg glass glass-hover border border-white/20 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-2">Faraday's Law</h3>
                <div className="space-y-3 text-sm text-white/70">
                  <p className="font-mono bg-white/5 p-2 rounded">EMF = -dΦ/dt</p>
                  <p>• Drag the magnet</p>
                  <p>• Faster motion = more current</p>
                  <p>• Direction matters!</p>
                  <p>• Changing flux induces EMF</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
