import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';

export default function LensSimulator() {
  const canvasRef = useRef(null);
  const [lensType, setLensType] = useState('convex');
  const [focalLength, setFocalLength] = useState(150);
  const [objectDistance, setObjectDistance] = useState(300);
  const [objectHeight, setObjectHeight] = useState(80);
  const [showRays, setShowRays] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const animate = () => {
      ctx.fillStyle = '#0f0f1e';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      drawLens(ctx, centerX, centerY);

      const f = lensType === 'convex' ? focalLength : -focalLength;
      const focalPoints = [
        { x: centerX - f, y: centerY, label: 'F' },
        { x: centerX + f, y: centerY, label: 'F' },
        { x: centerX - 2 * f, y: centerY, label: '2F' },
        { x: centerX + 2 * f, y: centerY, label: '2F' }
      ];

      focalPoints.forEach(point => {
        ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 200, 0, 0.9)';
        ctx.font = '12px Arial';
        ctx.fillText(point.label, point.x - 5, point.y + 20);
      });

      const objX = centerX - objectDistance;
      const objY = centerY;

      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(objX, objY);
      ctx.lineTo(objX, objY - objectHeight);
      ctx.stroke();

      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.moveTo(objX, objY - objectHeight);
      ctx.lineTo(objX - 5, objY - objectHeight + 10);
      ctx.lineTo(objX + 5, objY - objectHeight + 10);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.fillText('Object', objX - 20, objY + 25);

      const imageDistance = (1 / f - 1 / objectDistance) !== 0 ? 1 / (1 / f - 1 / objectDistance) : Infinity;
      const magnification = -imageDistance / objectDistance;
      const imageHeight = magnification * objectHeight;

      if (showRays && isFinite(imageDistance)) {
        drawRay(ctx, objX, objY - objectHeight, centerX, objY - objectHeight, centerX + imageDistance, objY - imageHeight, '#00ff88');
        
        const slopeToFocus = (0 - (objY - objectHeight)) / (centerX + f - objX);
        const yAtLens = (objY - objectHeight) + slopeToFocus * (centerX - objX);
        drawRay(ctx, objX, objY - objectHeight, centerX, yAtLens, centerX + imageDistance, objY - imageHeight, '#00aaff');
        
        drawRay(ctx, objX, objY - objectHeight, centerX, centerY, centerX + imageDistance, objY - imageHeight, '#ff00ff');
      }

      if (isFinite(imageDistance) && Math.abs(imageDistance) < 600) {
        const imgX = centerX + imageDistance;
        const imgY = centerY;

        ctx.strokeStyle = imageHeight > 0 ? '#4ecdc4' : '#ffaa44';
        ctx.lineWidth = 4;
        ctx.setLineDash(imageDistance < 0 ? [10, 5] : []);
        ctx.beginPath();
        ctx.moveTo(imgX, imgY);
        ctx.lineTo(imgX, imgY - imageHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = imageHeight > 0 ? '#4ecdc4' : '#ffaa44';
        const arrowDir = imageHeight > 0 ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(imgX, imgY - imageHeight);
        ctx.lineTo(imgX - 5, imgY - imageHeight + arrowDir * 10);
        ctx.lineTo(imgX + 5, imgY - imageHeight + arrowDir * 10);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        const imageType = imageDistance < 0 ? 'Virtual' : 'Real';
        const orientation = imageHeight > 0 ? 'Upright' : 'Inverted';
        ctx.fillText(`Image (${imageType}, ${orientation})`, imgX - 30, imgY + 25);
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [lensType, focalLength, objectDistance, objectHeight, showRays]);

  const drawLens = (ctx, x, y) => {
    const lensHeight = 200;
    const lensCurve = 30;

    if (lensType === 'convex') {
      ctx.fillStyle = 'rgba(100, 150, 255, 0.2)';
      ctx.strokeStyle = '#6699ff';
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      ctx.moveTo(x, y - lensHeight / 2);
      ctx.quadraticCurveTo(x + lensCurve, y, x, y + lensHeight / 2);
      ctx.quadraticCurveTo(x - lensCurve, y, x, y - lensHeight / 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(100, 150, 255, 0.2)';
      ctx.strokeStyle = '#6699ff';
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      ctx.moveTo(x, y - lensHeight / 2);
      ctx.quadraticCurveTo(x - lensCurve, y, x, y + lensHeight / 2);
      ctx.quadraticCurveTo(x + lensCurve, y, x, y - lensHeight / 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 600);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawRay = (ctx, x1, y1, x2, y2, x3, y3, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.stroke();
  };

  const f = lensType === 'convex' ? focalLength : -focalLength;
  const imageDistance = (1 / f - 1 / objectDistance) !== 0 ? 1 / (1 / f - 1 / objectDistance) : Infinity;
  const magnification = -imageDistance / objectDistance;

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)' }}>
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Lens Simulator</h1>
            <p className="text-white/60">Ray tracing through convex and concave lenses</p>
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

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="glass rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-white/60 mb-1">Image Distance</div>
                  <div className="text-2xl font-bold">
                    {isFinite(imageDistance) ? `${imageDistance.toFixed(1)} px` : '∞'}
                  </div>
                </div>
                <div className="glass rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-white/60 mb-1">Magnification</div>
                  <div className="text-2xl font-bold">
                    {isFinite(magnification) ? `${magnification.toFixed(2)}x` : '∞'}
                  </div>
                </div>
                <div className="glass rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-white/60 mb-1">Image Type</div>
                  <div className="text-2xl font-bold">
                    {imageDistance < 0 ? 'Virtual' : 'Real'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Controls</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Lens Type</label>
                    <select
                      value={lensType}
                      onChange={(e) => setLensType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
                    >
                      <option value="convex">Convex (Converging)</option>
                      <option value="concave">Concave (Diverging)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Focal Length: {focalLength} px</label>
                    <input
                      type="range"
                      min="50"
                      max="250"
                      value={focalLength}
                      onChange={(e) => setFocalLength(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Object Distance: {objectDistance} px</label>
                    <input
                      type="range"
                      min="100"
                      max="500"
                      value={objectDistance}
                      onChange={(e) => setObjectDistance(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Object Height: {objectHeight} px</label>
                    <input
                      type="range"
                      min="40"
                      max="150"
                      value={objectHeight}
                      onChange={(e) => setObjectHeight(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showRays}
                        onChange={(e) => setShowRays(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Show Light Rays</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-2">Lens Equation</h3>
                <div className="space-y-2 text-sm text-white/70">
                  <p className="font-mono bg-white/5 p-2 rounded">1/f = 1/dₒ + 1/dᵢ</p>
                  <p className="font-mono bg-white/5 p-2 rounded">M = -dᵢ/dₒ</p>
                  <p>F, 2F = Focal points</p>
                  <p>Dashed = Virtual image</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
