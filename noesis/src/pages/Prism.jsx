import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';

export default function Prism() {
  const canvasRef = useRef(null);
  const [prismAngle, setPrismAngle] = useState(60);
  const [incidentAngle, setIncidentAngle] = useState(50);
  const [showWavelengths, setShowWavelengths] = useState(true);
  const [animate, setAnimate] = useState(true);
  const [animationOffset, setAnimationOffset] = useState(0);

  const wavelengths = [
    { color: '#ff0000', name: 'Red', lambda: 700, n: 1.513 },
    { color: '#ff7f00', name: 'Orange', lambda: 620, n: 1.514 },
    { color: '#ffff00', name: 'Yellow', lambda: 580, n: 1.517 },
    { color: '#00ff00', name: 'Green', lambda: 550, n: 1.519 },
    { color: '#0000ff', name: 'Blue', lambda: 470, n: 1.528 },
    { color: '#4b0082', name: 'Indigo', lambda: 450, n: 1.532 },
    { color: '#9400d3', name: 'Violet', lambda: 400, n: 1.538 }
  ];

  useEffect(() => {
    if (animate) {
      const interval = setInterval(() => {
        setAnimationOffset(prev => (prev + 2) % 360);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      ctx.fillStyle = '#0f0f1e';
      ctx.fillRect(0, 0, width, height);

      const prismX = 250;
      const prismY = 300;
      const prismSize = 180;

      const angleRad = (prismAngle * Math.PI) / 180;
      const prismPoints = [
        { x: prismX, y: prismY - prismSize },
        { x: prismX + prismSize * Math.cos(angleRad), y: prismY + prismSize * Math.sin(angleRad) },
        { x: prismX - prismSize * Math.cos(angleRad), y: prismY + prismSize * Math.sin(angleRad) }
      ];

      const gradient = ctx.createLinearGradient(prismX - 100, prismY - 100, prismX + 100, prismY + 100);
      gradient.addColorStop(0, 'rgba(100, 150, 255, 0.15)');
      gradient.addColorStop(1, 'rgba(150, 100, 255, 0.25)');
      
      ctx.fillStyle = gradient;
      ctx.strokeStyle = '#6699ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(prismPoints[0].x, prismPoints[0].y);
      ctx.lineTo(prismPoints[1].x, prismPoints[1].y);
      ctx.lineTo(prismPoints[2].x, prismPoints[2].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const startX = 50;
      const startY = prismY - prismSize / 2;

      if (showWavelengths) {
        wavelengths.forEach((wave, index) => {
          const offset = (index - 3) * 3;
          traceRay(ctx, startX, startY + offset, incidentAngle, prismPoints, wave.n, wave.color, index);
        });
      } else {
        const avgN = wavelengths.reduce((sum, w) => sum + w.n, 0) / wavelengths.length;
        const whiteGradient = ctx.createLinearGradient(startX, startY, prismX, startY);
        whiteGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        whiteGradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
        
        ctx.strokeStyle = whiteGradient;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(prismX - 80, startY);
        ctx.stroke();

        wavelengths.forEach((wave, index) => {
          traceRay(ctx, prismX - 80, startY, 0, prismPoints, wave.n, wave.color, index);
        });
      }

      if (animate && showWavelengths) {
        for (let i = 0; i < 3; i++) {
          const x = startX + (animationOffset + i * 120) % (prismX - startX - 80);
          const size = 4;
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'white';
          ctx.beginPath();
          ctx.arc(x, startY, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('White Light', startX, startY - 30);

      if (showWavelengths) {
        const legendX = 600;
        const legendY = 100;
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Spectrum:', legendX, legendY);
        
        wavelengths.forEach((wave, index) => {
          ctx.fillStyle = wave.color;
          ctx.fillRect(legendX, legendY + 20 + index * 25, 30, 15);
          ctx.fillStyle = 'white';
          ctx.font = '12px Arial';
          ctx.fillText(`${wave.name} (${wave.lambda}nm)`, legendX + 40, legendY + 32 + index * 25);
        });
      }

      requestAnimationFrame(draw);
    };

    draw();
  }, [prismAngle, incidentAngle, showWavelengths, animate, animationOffset]);

  const traceRay = (ctx, startX, startY, angle, prismPoints, refractiveIndex, color, offset) => {
    const nAir = 1.0;
    const theta1 = (angle * Math.PI) / 180;
    
    const dx1 = Math.cos(theta1);
    const dy1 = Math.sin(theta1);
    
    const entryX = prismPoints[2].x;
    const entryY = startY;
    
    if (!showWavelengths) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
    }
    
    const sinTheta2 = (nAir / refractiveIndex) * Math.sin(theta1);
    if (Math.abs(sinTheta2) > 1) return;
    
    const theta2 = Math.asin(sinTheta2);
    
    const pathLength = 150;
    const dx2 = Math.cos(theta2);
    const dy2 = Math.sin(theta2);
    
    const exitX = entryX + pathLength * dx2;
    const exitY = entryY + pathLength * dy2;
    
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(entryX, entryY);
    ctx.lineTo(exitX, exitY);
    ctx.stroke();
    
    const normalAngle = Math.PI / 6;
    const relativeAngle = theta2 - normalAngle;
    const sinTheta3 = (refractiveIndex / nAir) * Math.sin(relativeAngle);
    
    if (Math.abs(sinTheta3) <= 1) {
      const theta3 = Math.asin(sinTheta3);
      const exitAngle = normalAngle + theta3;
      
      const finalLength = 200;
      const finalX = exitX + finalLength * Math.cos(exitAngle);
      const finalY = exitY + finalLength * Math.sin(exitAngle);
      
      ctx.beginPath();
      ctx.moveTo(exitX, exitY);
      ctx.lineTo(finalX, finalY);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1.0;
  };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)' }}>
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Prism Dispersion</h1>
            <p className="text-white/60">White light splitting into spectrum through a prism</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="glass rounded-2xl p-6 border border-white/10">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full rounded-lg"
                  style={{ background: '#0f0f1e' }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Controls</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Prism Angle: {prismAngle}°</label>
                    <input
                      type="range"
                      min="30"
                      max="90"
                      value={prismAngle}
                      onChange={(e) => setPrismAngle(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Incident Angle: {incidentAngle}°</label>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={incidentAngle}
                      onChange={(e) => setIncidentAngle(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showWavelengths}
                        onChange={(e) => setShowWavelengths(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Show Color Separation</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={animate}
                        onChange={(e) => setAnimate(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Animate Light Particles</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-2">Dispersion</h3>
                <div className="space-y-2 text-sm text-white/70">
                  <p>• Different wavelengths refract at different angles</p>
                  <p>• Violet bends most (highest n)</p>
                  <p>• Red bends least (lowest n)</p>
                  <p>• Creates rainbow spectrum</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
