import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';

export default function PascalsLaw() {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  
  const [smallPistonArea, setSmallPistonArea] = useState(10);
  const [largePistonArea, setLargePistonArea] = useState(40);
  const [appliedForce, setAppliedForce] = useState(50);
  const [fluidDensity, setFluidDensity] = useState(1000);
  const [isAnimating, setIsAnimating] = useState(false);
  const [smallPistonPos, setSmallPistonPos] = useState(0);
  const [largePistonPos, setLargePistonPos] = useState(0);
  
  const canvasWidth = 900;
  const canvasHeight = 600;

  const pressure = appliedForce / smallPistonArea;
  const outputForce = pressure * largePistonArea;
  const mechanicalAdvantage = largePistonArea / smallPistonArea;

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

  const applyPressure = () => {
    setIsAnimating(true);
    
    let progress = 0;
    const maxDisplacement = 50;
    const speed = 2;
    
    const animate = () => {
      progress += speed;
      
      if (progress >= maxDisplacement) {
        progress = maxDisplacement;
        setTimeout(() => {
          setIsAnimating(false);
          setSmallPistonPos(0);
          setLargePistonPos(0);
        }, 500);
      }
      
      setSmallPistonPos(progress);
      setLargePistonPos(progress * (smallPistonArea / largePistonArea));
      
      if (progress < maxDisplacement) {
        animationIdRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  const reset = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    setIsAnimating(false);
    setSmallPistonPos(0);
    setLargePistonPos(0);
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
    
    const leftCylinderX = 150;
    const rightCylinderX = width - 250;
    const baseY = height - 150;
    
    const smallRadius = Math.sqrt(smallPistonArea) * 5;
    const largeRadius = Math.sqrt(largePistonArea) * 5;
    
    const tubeHeight = 30;
    const tubeY = baseY + 20;
    
    ctx.fillStyle = '#1e40af';
    ctx.globalAlpha = 0.6;
    
    const fluidLevel = baseY - smallPistonPos;
    ctx.fillRect(leftCylinderX - smallRadius, fluidLevel, smallRadius * 2, smallPistonPos + 20);
    
    ctx.fillRect(leftCylinderX - 15, tubeY, rightCylinderX - leftCylinderX + 30, tubeHeight);
    
    const largePistonFluidTop = baseY - largePistonPos;
    ctx.fillRect(rightCylinderX - largeRadius, largePistonFluidTop, largeRadius * 2, largePistonPos + 20);
    
    ctx.globalAlpha = 1;
    
    ctx.strokeStyle = '#525252';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#262626';
    
    ctx.beginPath();
    ctx.moveTo(leftCylinderX - smallRadius, baseY);
    ctx.lineTo(leftCylinderX - smallRadius, baseY - 200);
    ctx.lineTo(leftCylinderX + smallRadius, baseY - 200);
    ctx.lineTo(leftCylinderX + smallRadius, baseY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(rightCylinderX - largeRadius, baseY);
    ctx.lineTo(rightCylinderX - largeRadius, baseY - 200);
    ctx.lineTo(rightCylinderX + largeRadius, baseY - 200);
    ctx.lineTo(rightCylinderX + largeRadius, baseY);
    ctx.stroke();
    
    ctx.fillRect(leftCylinderX - 15, tubeY, rightCylinderX - leftCylinderX + 30, tubeHeight);
    ctx.strokeRect(leftCylinderX - 15, tubeY, rightCylinderX - leftCylinderX + 30, tubeHeight);
    
    const smallPistonY = baseY - 200 - 10 + smallPistonPos;
    ctx.fillStyle = '#737373';
    ctx.fillRect(leftCylinderX - smallRadius - 5, smallPistonY, smallRadius * 2 + 10, 10);
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 2;
    ctx.strokeRect(leftCylinderX - smallRadius - 5, smallPistonY, smallRadius * 2 + 10, 10);
    
    ctx.fillStyle = '#525252';
    ctx.fillRect(leftCylinderX - 8, smallPistonY - 40, 16, 40);
    ctx.strokeRect(leftCylinderX - 8, smallPistonY - 40, 16, 40);
    
    const largePistonY = baseY - 200 - 10 + largePistonPos;
    ctx.fillStyle = '#737373';
    ctx.fillRect(rightCylinderX - largeRadius - 5, largePistonY, largeRadius * 2 + 10, 10);
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 2;
    ctx.strokeRect(rightCylinderX - largeRadius - 5, largePistonY, largeRadius * 2 + 10, 10);
    
    ctx.fillStyle = '#525252';
    ctx.fillRect(rightCylinderX - 8, largePistonY - 40, 16, 40);
    ctx.strokeRect(rightCylinderX - 8, largePistonY - 40, 16, 40);
    
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(leftCylinderX, smallPistonY - 40);
    ctx.lineTo(leftCylinderX - 10, smallPistonY - 60);
    ctx.lineTo(leftCylinderX + 10, smallPistonY - 60);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftCylinderX, smallPistonY - 60);
    ctx.lineTo(leftCylinderX, smallPistonY - 60 - appliedForce * 0.5);
    ctx.stroke();
    
    const arrowTipY = smallPistonY - 60 - appliedForce * 0.5;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(leftCylinderX, arrowTipY);
    ctx.lineTo(leftCylinderX - 8, arrowTipY + 15);
    ctx.lineTo(leftCylinderX + 8, arrowTipY + 15);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(rightCylinderX, largePistonY - 40);
    ctx.lineTo(rightCylinderX - 10, largePistonY - 60);
    ctx.lineTo(rightCylinderX + 10, largePistonY - 60);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rightCylinderX, largePistonY - 60);
    ctx.lineTo(rightCylinderX, largePistonY - 60 - outputForce * 0.5);
    ctx.stroke();
    
    const outputArrowTipY = largePistonY - 60 - outputForce * 0.5;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(rightCylinderX, outputArrowTipY);
    ctx.lineTo(rightCylinderX - 8, outputArrowTipY + 15);
    ctx.lineTo(rightCylinderX + 8, outputArrowTipY + 15);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Input Force`, leftCylinderX, arrowTipY - 10);
    ctx.fillText(`${appliedForce.toFixed(0)} N`, leftCylinderX, arrowTipY - 25);
    
    ctx.fillText(`Output Force`, rightCylinderX, outputArrowTipY - 10);
    ctx.fillText(`${outputForce.toFixed(0)} N`, rightCylinderX, outputArrowTipY - 25);
    
    ctx.fillStyle = '#a855f7';
    ctx.font = '12px sans-serif';
    ctx.fillText(`A = ${smallPistonArea} cm²`, leftCylinderX, baseY + 40);
    ctx.fillText(`A = ${largePistonArea} cm²`, rightCylinderX, baseY + 40);
    
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Pressure: ${pressure.toFixed(2)} N/cm²`, width / 2, 40);
  };

  useEffect(() => {
    draw();
  }, [smallPistonArea, largePistonArea, appliedForce, smallPistonPos, largePistonPos]);

  useEffect(() => {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Pascal's Law - Hydraulic Press
            </h1>
            <p className="text-neutral-400">
              Explore how pressure in a confined fluid is transmitted equally in all directions
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
                  onClick={applyPressure}
                  disabled={isAnimating}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-neutral-700 disabled:to-neutral-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  {isAnimating ? 'Applying Pressure...' : 'Apply Pressure'}
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
                <h3 className="text-lg font-semibold mb-4 text-purple-400">Input Piston</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">
                      Area: <span className="text-purple-400">{smallPistonArea} cm²</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={smallPistonArea}
                      onChange={(e) => setSmallPistonArea(Number(e.target.value))}
                      disabled={isAnimating}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Applied Force: <span className="text-purple-400">{appliedForce} N</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="5"
                      value={appliedForce}
                      onChange={(e) => setAppliedForce(Number(e.target.value))}
                      disabled={isAnimating}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Output Piston</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">
                      Area: <span className="text-blue-400">{largePistonArea} cm²</span>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={largePistonArea}
                      onChange={(e) => setLargePistonArea(Number(e.target.value))}
                      disabled={isAnimating}
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-yellow-400">Results</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-neutral-800/50 rounded-lg">
                    <div className="text-neutral-400 mb-1">Pressure in Fluid</div>
                    <div className="text-2xl font-bold text-yellow-400">{pressure.toFixed(2)} N/cm²</div>
                  </div>
                  
                  <div className="p-3 bg-neutral-800/50 rounded-lg">
                    <div className="text-neutral-400 mb-1">Output Force</div>
                    <div className="text-2xl font-bold text-green-400">{outputForce.toFixed(0)} N</div>
                  </div>
                  
                  <div className="p-3 bg-neutral-800/50 rounded-lg">
                    <div className="text-neutral-400 mb-1">Mechanical Advantage</div>
                    <div className="text-2xl font-bold text-purple-400">{mechanicalAdvantage.toFixed(2)}×</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
                <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <span>💡</span> Pascal's Law
                </h4>
                <p className="text-sm text-neutral-300">
                  P = F₁/A₁ = F₂/A₂
                </p>
                <p className="text-xs text-neutral-400 mt-2">
                  Pressure applied to a confined fluid is transmitted undiminished throughout the fluid.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Physics Concepts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-300">
              <div>
                <h4 className="font-medium text-neutral-200 mb-1">Pascal's Principle</h4>
                <p className="text-neutral-400">Pressure applied to a confined incompressible fluid is transmitted equally in all directions</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-200 mb-1">Hydraulic Multiplication</h4>
                <p className="text-neutral-400">Small force on small piston creates large force on large piston while maintaining equal pressure</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-200 mb-1">Mechanical Advantage</h4>
                <p className="text-neutral-400">Force multiplication ratio equals the ratio of piston areas: MA = A₂/A₁</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-200 mb-1">Real-World Applications</h4>
                <p className="text-neutral-400">Car brakes, hydraulic jacks, lifts, and heavy machinery all use Pascal's law</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
