import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';

export default function ElectricField() {
  const canvasRef = useRef(null);
  const [charges, setCharges] = useState([
    { x: 300, y: 300, charge: 1, dragging: false },
    { x: 500, y: 300, charge: -1, dragging: false }
  ]);
  const [showField, setShowField] = useState(true);
  const [showForce, setShowForce] = useState(false);
  const [testCharge, setTestCharge] = useState({ x: 400, y: 200 });
  const [density, setDensity] = useState(25);

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
        const step = density;
        for (let x = step; x < width; x += step) {
          for (let y = step; y < height; y += step) {
            const field = calculateField(x, y);
            const magnitude = Math.sqrt(field.x ** 2 + field.y ** 2);
            const angle = Math.atan2(field.y, field.x);
            
            const maxMag = 0.5;
            const normalizedMag = Math.min(magnitude, maxMag) / maxMag;
            
            ctx.strokeStyle = `rgba(102, 126, 234, ${normalizedMag * 0.6})`;
            ctx.lineWidth = 1;
            
            const len = 10 * normalizedMag;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + len * Math.cos(angle), y + len * Math.sin(angle));
            ctx.stroke();

            ctx.fillStyle = `rgba(102, 126, 234, ${normalizedMag * 0.8})`;
            ctx.beginPath();
            ctx.arc(
              x + len * Math.cos(angle),
              y + len * Math.sin(angle),
              2,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
      }

      charges.forEach((charge, index) => {
        const radius = 15;
        const gradient = ctx.createRadialGradient(charge.x, charge.y, 0, charge.x, charge.y, radius);
        
        if (charge.charge > 0) {
          gradient.addColorStop(0, '#ff4444');
          gradient.addColorStop(1, '#cc0000');
        } else {
          gradient.addColorStop(0, '#4444ff');
          gradient.addColorStop(1, '#0000cc');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(charge.x, charge.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(charge.x, charge.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(charge.charge > 0 ? '+' : '−', charge.x, charge.y);
      });

      if (showForce) {
        const force = calculateField(testCharge.x, testCharge.y);
        const magnitude = Math.sqrt(force.x ** 2 + force.y ** 2);
        const angle = Math.atan2(force.y, force.x);

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(testCharge.x, testCharge.y);
        const arrowLen = Math.min(magnitude * 100, 100);
        ctx.lineTo(
          testCharge.x + arrowLen * Math.cos(angle),
          testCharge.y + arrowLen * Math.sin(angle)
        );
        ctx.stroke();

        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(testCharge.x, testCharge.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(
          `F = ${magnitude.toFixed(3)} N`,
          testCharge.x,
          testCharge.y - 20
        );
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [charges, showField, showForce, testCharge, density]);

  const calculateField = (x, y) => {
    let Ex = 0;
    let Ey = 0;
    const k = 0.01;

    charges.forEach((charge) => {
      const dx = x - charge.x;
      const dy = y - charge.y;
      const r = Math.sqrt(dx ** 2 + dy ** 2);
      
      if (r > 5) {
        const E = (k * charge.charge) / (r ** 2);
        Ex += E * (dx / r);
        Ey += E * (dy / r);
      }
    });

    return { x: Ex, y: Ey };
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedChargeIndex = charges.findIndex((charge) => {
      const dx = x - charge.x;
      const dy = y - charge.y;
      return Math.sqrt(dx ** 2 + dy ** 2) < 15;
    });

    if (clickedChargeIndex !== -1) {
      const newCharges = [...charges];
      newCharges[clickedChargeIndex].dragging = true;
      setCharges(newCharges);
    }

    if (showForce) {
      setTestCharge({ x, y });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const draggingCharge = charges.find((c) => c.dragging);
    if (draggingCharge) {
      const newCharges = charges.map((c) =>
        c.dragging ? { ...c, x, y } : c
      );
      setCharges(newCharges);
    }

    if (showForce && e.buttons === 1) {
      setTestCharge({ x, y });
    }
  };

  const handleMouseUp = () => {
    const newCharges = charges.map((c) => ({ ...c, dragging: false }));
    setCharges(newCharges);
  };

  const addCharge = (charge) => {
    setCharges([...charges, { x: 400, y: 300, charge, dragging: false }]);
  };

  const removeLastCharge = () => {
    if (charges.length > 0) {
      setCharges(charges.slice(0, -1));
    }
  };

  const reset = () => {
    setCharges([
      { x: 300, y: 300, charge: 1, dragging: false },
      { x: 500, y: 300, charge: -1, dragging: false }
    ]);
    setTestCharge({ x: 400, y: 200 });
  };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)' }}>
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Electric Field Lines</h1>
            <p className="text-white/60">Visualize electric fields created by point charges</p>
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
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
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
                      <span>Show Field Lines</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showForce}
                        onChange={(e) => setShowForce(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Show Force Vector</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Field Density: {density}</label>
                    <input
                      type="range"
                      min="15"
                      max="40"
                      value={density}
                      onChange={(e) => setDensity(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => addCharge(1)}
                      className="w-full px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 transition-colors"
                    >
                      Add Positive (+)
                    </button>
                    <button
                      onClick={() => addCharge(-1)}
                      className="w-full px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 transition-colors"
                    >
                      Add Negative (−)
                    </button>
                    <button
                      onClick={removeLastCharge}
                      className="w-full px-4 py-2 rounded-lg glass glass-hover border border-white/20 transition-colors"
                    >
                      Remove Last
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
                <h3 className="text-lg font-semibold mb-2">Info</h3>
                <div className="space-y-2 text-sm text-white/70">
                  <p>• Drag charges to move them</p>
                  <p>• Red = Positive charge</p>
                  <p>• Blue = Negative charge</p>
                  <p>• Click to show force at point</p>
                  <p>• Field strength: E = kQ/r²</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
