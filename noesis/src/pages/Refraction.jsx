import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';

export default function Refraction() {
  const canvasRef = useRef(null);
  const [angle1, setAngle1] = useState(30);
  const [material1, setMaterial1] = useState('air');
  const [material2, setMaterial2] = useState('water');
  const [showNormals, setShowNormals] = useState(true);
  const [showAngles, setShowAngles] = useState(true);

  const materials = {
    air: { n: 1.00, color: 'rgba(135, 206, 235, 0.1)', name: 'Air' },
    water: { n: 1.33, color: 'rgba(100, 149, 237, 0.3)', name: 'Water' },
    glass: { n: 1.52, color: 'rgba(173, 216, 230, 0.4)', name: 'Glass' },
    diamond: { n: 2.42, color: 'rgba(200, 200, 255, 0.5)', name: 'Diamond' }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    const animate = () => {
      ctx.fillStyle = '#0f0f1e';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = materials[material1].color;
      ctx.fillRect(0, 0, width, centerY);
      ctx.fillStyle = materials[material2].color;
      ctx.fillRect(0, centerY, width, height - centerY);

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      if (showNormals) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const n1 = materials[material1].n;
      const n2 = materials[material2].n;
      const theta1 = (angle1 * Math.PI) / 180;
      const sinTheta2 = (n1 / n2) * Math.sin(theta1);
      
      const totalInternalReflection = sinTheta2 > 1;
      let theta2 = 0;
      
      if (!totalInternalReflection) {
        theta2 = Math.asin(sinTheta2);
      }

      const startX = width / 2 - 300;
      const startY = 50;
      const interfaceX = width / 2;

      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(interfaceX, centerY);
      ctx.stroke();

      const arrowSize = 10;
      const incidentAngle = Math.atan2(centerY - startY, interfaceX - startX);
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.moveTo(interfaceX, centerY);
      ctx.lineTo(
        interfaceX - arrowSize * Math.cos(incidentAngle - 0.3),
        centerY - arrowSize * Math.sin(incidentAngle - 0.3)
      );
      ctx.lineTo(
        interfaceX - arrowSize * Math.cos(incidentAngle + 0.3),
        centerY - arrowSize * Math.sin(incidentAngle + 0.3)
      );
      ctx.fill();

      if (totalInternalReflection) {
        const reflectX = width / 2 + 300;
        const reflectY = 50;
        
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(interfaceX, centerY);
        ctx.lineTo(reflectX, reflectY);
        ctx.stroke();

        const reflectAngle = Math.atan2(reflectY - centerY, reflectX - interfaceX);
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.moveTo(reflectX, reflectY);
        ctx.lineTo(
          reflectX - arrowSize * Math.cos(reflectAngle - 0.3),
          reflectY - arrowSize * Math.sin(reflectAngle - 0.3)
        );
        ctx.lineTo(
          reflectX - arrowSize * Math.cos(reflectAngle + 0.3),
          reflectY - arrowSize * Math.sin(reflectAngle + 0.3)
        );
        ctx.fill();

        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Total Internal Reflection!', width / 2 + 50, centerY + 100);
      } else {
        const refractLength = 300;
        const refractX = interfaceX + refractLength * Math.sin(theta2);
        const refractY = centerY + refractLength * Math.cos(theta2);

        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(interfaceX, centerY);
        ctx.lineTo(refractX, refractY);
        ctx.stroke();

        const refractAngle = Math.atan2(refractY - centerY, refractX - interfaceX);
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.moveTo(refractX, refractY);
        ctx.lineTo(
          refractX - arrowSize * Math.cos(refractAngle - 0.3),
          refractY - arrowSize * Math.sin(refractAngle - 0.3)
        );
        ctx.lineTo(
          refractX - arrowSize * Math.cos(refractAngle + 0.3),
          refractY - arrowSize * Math.sin(refractAngle + 0.3)
        );
        ctx.fill();
      }

      if (showAngles) {
        ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(interfaceX, centerY, 60, -Math.PI / 2, -Math.PI / 2 + theta1, false);
        ctx.stroke();

        ctx.fillStyle = '#ff6b6b';
        ctx.font = '14px Arial';
        ctx.fillText(`θ₁ = ${angle1}°`, interfaceX + 70, centerY - 80);

        if (!totalInternalReflection) {
          ctx.strokeStyle = 'rgba(78, 205, 196, 0.5)';
          ctx.beginPath();
          ctx.arc(interfaceX, centerY, 60, Math.PI / 2, Math.PI / 2 + theta2, false);
          ctx.stroke();

          ctx.fillStyle = '#4ecdc4';
          ctx.fillText(`θ₂ = ${((theta2 * 180) / Math.PI).toFixed(1)}°`, interfaceX + 70, centerY + 100);
        }
      }

      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${materials[material1].name} (n = ${n1})`, width / 2, 30);
      ctx.fillText(`${materials[material2].name} (n = ${n2})`, width / 2, height - 20);

      ctx.textAlign = 'left';
      ctx.font = '14px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(`Snell's Law: n₁sin(θ₁) = n₂sin(θ₂)`, 20, height - 20);

      requestAnimationFrame(animate);
    };

    animate();
  }, [angle1, material1, material2, showNormals, showAngles]);

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)' }}>
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Refraction</h1>
            <p className="text-white/60">Light bending through different materials - Snell's Law</p>
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
                    <label className="block text-sm mb-2">Incident Angle: {angle1}°</label>
                    <input
                      type="range"
                      min="0"
                      max="89"
                      value={angle1}
                      onChange={(e) => setAngle1(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Top Material</label>
                    <select
                      value={material1}
                      onChange={(e) => setMaterial1(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
                    >
                      <option value="air">Air (n=1.00)</option>
                      <option value="water">Water (n=1.33)</option>
                      <option value="glass">Glass (n=1.52)</option>
                      <option value="diamond">Diamond (n=2.42)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Bottom Material</label>
                    <select
                      value={material2}
                      onChange={(e) => setMaterial2(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
                    >
                      <option value="air">Air (n=1.00)</option>
                      <option value="water">Water (n=1.33)</option>
                      <option value="glass">Glass (n=1.52)</option>
                      <option value="diamond">Diamond (n=2.42)</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showNormals}
                        onChange={(e) => setShowNormals(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Show Normal Line</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showAngles}
                        onChange={(e) => setShowAngles(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Show Angles</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-2">Info</h3>
                <div className="space-y-2 text-sm text-white/70">
                  <p>🔴 Red = Incident ray</p>
                  <p>🔵 Cyan = Refracted ray</p>
                  <p>🟡 Orange = Reflection</p>
                  <p>• Light bends toward normal when entering denser medium</p>
                  <p>• Critical angle causes total internal reflection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
