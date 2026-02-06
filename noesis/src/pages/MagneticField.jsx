import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';

export default function MagneticField() {
  const canvasRef = useRef(null);
  const [current, setCurrent] = useState(5);
  const [wireType, setWireType] = useState('straight');
  const [showCompass, setShowCompass] = useState(true);
  const [compassPos, setCompassPos] = useState({ x: 400, y: 200 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const animate = () => {
      ctx.fillStyle = '#0f0f1e';
      ctx.fillRect(0, 0, width, height);

      if (wireType === 'straight') {
        drawStraightWire(ctx, width, height);
      } else if (wireType === 'loop') {
        drawCurrentLoop(ctx, width, height);
      } else {
        drawSolenoid(ctx, width, height);
      }

      if (showCompass) {
        drawCompass(ctx);
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [current, wireType, showCompass, compassPos]);

  const drawStraightWire = (ctx, width, height) => {
    const wireY = height / 2;
    
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, wireY);
    ctx.lineTo(width, wireY);
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`I = ${current.toFixed(1)} A`, 20, wireY - 20);

    const arrow = current > 0 ? '→' : '←';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(arrow, width - 50, wireY + 8);

    const step = 40;
    for (let x = step; x < width; x += step) {
      for (let y = step; y < height; y += step) {
        if (Math.abs(y - wireY) < 20) continue;
        
        const dy = y - wireY;
        const B = calculateStraightWireField(dy);
        const direction = current > 0 ? (y > wireY ? 1 : -1) : (y > wireY ? -1 : 1);
        
        drawFieldPoint(ctx, x, y, B, direction, 0);
      }
    }
  };

  const drawCurrentLoop = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 120;

    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    const arrowAngle = Math.PI / 4;
    const arrowX = centerX + radius * Math.cos(arrowAngle);
    const arrowY = centerY + radius * Math.sin(arrowAngle);
    const tangentAngle = arrowAngle + (current > 0 ? Math.PI / 2 : -Math.PI / 2);
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(
      arrowX - 15 * Math.cos(tangentAngle - 0.3),
      arrowY - 15 * Math.sin(tangentAngle - 0.3)
    );
    ctx.lineTo(
      arrowX - 15 * Math.cos(tangentAngle + 0.3),
      arrowY - 15 * Math.sin(tangentAngle + 0.3)
    );
    ctx.fill();

    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`I = ${current.toFixed(1)} A`, centerX, centerY - radius - 20);

    const step = 35;
    for (let x = step; x < width; x += step) {
      for (let y = step; y < height; y += step) {
        const dx = x - centerX;
        const dy = y - centerY;
        const r = Math.sqrt(dx ** 2 + dy ** 2);
        
        if (Math.abs(r - radius) < 25) continue;
        
        const B = calculateLoopField(r, radius);
        const angle = Math.atan2(dy, dx);
        
        drawFieldPoint(ctx, x, y, B, r < radius ? 0 : 0, angle);
      }
    }
  };

  const drawSolenoid = (ctx, width, height) => {
    const centerX = width / 2;
    const solenoidWidth = 300;
    const solenoidHeight = 200;
    const coils = 8;
    
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 4;
    
    for (let i = 0; i < coils; i++) {
      const x = centerX - solenoidWidth / 2 + (solenoidWidth / coils) * i;
      
      ctx.beginPath();
      ctx.arc(x, height / 2, solenoidHeight / 4, 0, Math.PI, true);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(x + solenoidWidth / coils, height / 2, solenoidHeight / 4, Math.PI, 0, true);
      ctx.stroke();
    }

    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(centerX - solenoidWidth / 2, height / 2 - solenoidHeight / 4);
    ctx.lineTo(centerX + solenoidWidth / 2, height / 2 - solenoidHeight / 4);
    ctx.stroke();

    const arrow = current > 0 ? '→' : '←';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(arrow, centerX + solenoidWidth / 2 + 30, height / 2 - solenoidHeight / 4 + 8);
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`I = ${current.toFixed(1)} A`, centerX, height / 2 - solenoidHeight / 2 - 30);

    const step = 40;
    for (let x = step; x < width; x += step) {
      for (let y = step; y < height; y += step) {
        const isInside = x > centerX - solenoidWidth / 2 && 
                        x < centerX + solenoidWidth / 2 &&
                        Math.abs(y - height / 2) < solenoidHeight / 4;
        
        if (Math.abs(y - height / 2) < 10) continue;
        
        const B = isInside ? Math.abs(current) * 0.3 : Math.abs(current) * 0.1;
        const direction = current > 0 ? 1 : -1;
        
        drawFieldPoint(ctx, x, y, B, isInside ? 0 : direction, isInside ? 0 : Math.PI);
      }
    }
  };

  const calculateStraightWireField = (distance) => {
    const d = Math.abs(distance);
    if (d < 1) return 0;
    return (Math.abs(current) * 0.5) / d;
  };

  const calculateLoopField = (r, radius) => {
    if (r < 1) return 0;
    return Math.abs(current) * 0.3 * (radius / (r + radius));
  };

  const drawFieldPoint = (ctx, x, y, strength, direction, baseAngle) => {
    const normalizedStrength = Math.min(strength, 1);
    
    ctx.strokeStyle = `rgba(138, 43, 226, ${normalizedStrength * 0.8})`;
    ctx.lineWidth = 1.5;
    
    const len = 8 * normalizedStrength;
    let angle;
    
    if (wireType === 'straight') {
      angle = direction > 0 ? 0 : Math.PI;
    } else if (wireType === 'loop') {
      angle = baseAngle + (direction > 0 ? Math.PI / 2 : -Math.PI / 2);
    } else {
      angle = baseAngle;
    }
    
    ctx.beginPath();
    ctx.arc(x, y, len, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(138, 43, 226, ${normalizedStrength})`;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawCompass = (ctx) => {
    const field = getFieldAt(compassPos.x, compassPos.y);
    const angle = Math.atan2(field.y, field.x);
    
    ctx.save();
    ctx.translate(compassPos.x, compassPos.y);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.rotate(angle);
    
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-5, -5);
    ctx.lineTo(-5, 5);
    ctx.fill();
    
    ctx.fillStyle = '#4444ff';
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(5, -5);
    ctx.lineTo(5, 5);
    ctx.fill();
    
    ctx.restore();
  };

  const getFieldAt = (x, y) => {
    if (wireType === 'straight') {
      const wireY = 300;
      const dy = y - wireY;
      const direction = current > 0 ? (y > wireY ? 1 : -1) : (y > wireY ? -1 : 1);
      return { x: direction, y: 0 };
    } else if (wireType === 'loop') {
      const centerX = 400;
      const centerY = 300;
      const angle = Math.atan2(y - centerY, x - centerX);
      const dir = current > 0 ? 1 : -1;
      return {
        x: -Math.sin(angle) * dir,
        y: Math.cos(angle) * dir
      };
    } else {
      const direction = current > 0 ? 1 : -1;
      return { x: 0, y: direction };
    }
  };

  const handleCanvasClick = (e) => {
    if (!showCompass) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    setCompassPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)' }}>
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Magnetic Field</h1>
            <p className="text-white/60">Visualize magnetic fields from current-carrying wires</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="glass rounded-2xl p-6 border border-white/10">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full rounded-lg cursor-crosshair"
                  style={{ background: '#0f0f1e' }}
                  onClick={handleCanvasClick}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Controls</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Wire Configuration</label>
                    <select
                      value={wireType}
                      onChange={(e) => setWireType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
                    >
                      <option value="straight">Straight Wire</option>
                      <option value="loop">Current Loop</option>
                      <option value="solenoid">Solenoid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Current: {current.toFixed(1)} A</label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="0.5"
                      value={current}
                      onChange={(e) => setCurrent(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCompass}
                        onChange={(e) => setShowCompass(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Show Compass</span>
                    </label>
                  </div>

                  <button
                    onClick={() => setCurrent(0)}
                    className="w-full px-4 py-2 rounded-lg glass glass-hover border border-white/20 transition-colors"
                  >
                    Turn Off Current
                  </button>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-2">Info</h3>
                <div className="space-y-2 text-sm text-white/70">
                  <p>• Red wire = current path</p>
                  <p>• Purple circles = B field</p>
                  <p>• Red needle points North</p>
                  <p>• Click to move compass</p>
                  <p>• Right-hand rule applies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
