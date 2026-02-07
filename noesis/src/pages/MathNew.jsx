import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { create, all } from 'mathjs';
import { FiZoomIn, FiZoomOut, FiMaximize2, FiMove, FiCircle, FiSlash, FiMinus, FiHome } from 'react-icons/fi';

const math = create(all);

const colors = [
  '#3b82f6', '#ef4444', '#22c55e', '#a78bfa', '#f97316', 
  '#ec4899', '#eab308', '#06b6d4', '#8b5cf6', '#f59e0b'
];

export default function MathNew() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [mode, setMode] = useState('select');
  const [objects, setObjects] = useState([]);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [tempConstruction, setTempConstruction] = useState(null);
  const [functions, setFunctions] = useState([]);
  const [parameters, setParameters] = useState({});
  const [viewport, setViewport] = useState({ centerX: 0, centerY: 0, scale: 40 });
  const [mousePos, setMousePos] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedObject, setDraggedObject] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [showAlgebra, setShowAlgebra] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const nextId = useRef(1);

  const pixelToGraph = (px, py) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const gx = (px - canvas.width / 2) / viewport.scale + viewport.centerX;
    const gy = -(py - canvas.height / 2) / viewport.scale + viewport.centerY;
    return { x: gx, y: gy };
  };

  const graphToPixel = (gx, gy) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const px = (gx - viewport.centerX) * viewport.scale + canvas.width / 2;
    const py = -(gy - viewport.centerY) * viewport.scale + canvas.height / 2;
    return { x: px, y: py };
  };

  const snap = (value) => {
    if (!snapToGrid) return value;
    const gridSize = 0.5;
    return Math.round(value / gridSize) * gridSize;
  };

  const distance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const pointDistance = (p1, p2) => distance(p1.x, p1.y, p2.x, p2.y);

  const getPoint = (id) => objects.find(o => o.id === id && o.type === 'point') || null;

  const evaluateFunction = (expr, x, params) => {
    try {
      const scope = { x, ...params };
      const node = math.parse(expr);
      const result = node.evaluate(scope);
      return typeof result === 'number' && isFinite(result) ? result : null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const allParams = new Set();
    const mathFunctions = ['sin', 'cos', 'tan', 'sqrt', 'exp', 'log', 'abs', 'ceil', 
                          'floor', 'round', 'sign', 'ln', 'asin', 'acos', 'atan', 
                          'sinh', 'cosh', 'tanh', 'log10', 'cbrt', 'e', 'pi', 'PI'];
    
    functions.forEach(func => {
      if (!func.expression.trim()) return;
      try {
        const node = math.parse(func.expression);
        const symbols = node.filter(n => n.isSymbolNode).map(n => n.name);
        symbols.forEach(sym => {
          if (sym !== 'x' && sym !== 'y' && !mathFunctions.includes(sym)) {
            allParams.add(sym);
          }
        });
      } catch (e) {
        // Ignore parsing errors
      }
    });

    setParameters(prev => {
      const updated = { ...prev };
      allParams.forEach(param => {
        if (!(param in updated)) {
          updated[param] = { value: 1, min: -10, max: 10 };
        }
      });
      Object.keys(updated).forEach(param => {
        if (!allParams.has(param)) {
          delete updated[param];
        }
      });
      return updated;
    });
  }, [functions]);

  const getObjectAtPosition = (px, py, tolerance = 10) => {
    const graphPos = pixelToGraph(px, py);
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (!obj.visible) continue;
      if (obj.type === 'point') {
        const screenPos = graphToPixel(obj.x, obj.y);
        if (distance(px, py, screenPos.x, screenPos.y) < tolerance) return obj;
      }
    }
    return null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      draw();
    };
    setTimeout(resizeCanvas, 0);
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    draw();
  }, [objects, functions, parameters, viewport, showGrid, hoveredObject, selectedObjects, tempConstruction]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, w, h);

    if (showGrid) {
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 1;
      const gridSpacing = Math.pow(10, Math.floor(Math.log10(50 / viewport.scale)));
      const bounds = {
        minX: pixelToGraph(0, 0).x,
        maxX: pixelToGraph(w, 0).x,
        minY: pixelToGraph(0, h).y,
        maxY: pixelToGraph(0, 0).y
      };
      const startX = Math.floor(bounds.minX / gridSpacing) * gridSpacing;
      const startY = Math.floor(bounds.minY / gridSpacing) * gridSpacing;
      for (let x = startX; x <= bounds.maxX; x += gridSpacing) {
        const px = graphToPixel(x, 0).x;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, h);
        ctx.stroke();
      }
      for (let y = startY; y <= bounds.maxY; y += gridSpacing) {
        const py = graphToPixel(0, y).y;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
        ctx.stroke();
      }
    }

    const origin = graphToPixel(0, 0);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(w, origin.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, h);
    ctx.stroke();

    objects.forEach(obj => {
      if (!obj.visible) return;
      const isSelected = selectedObjects.includes(obj.id);
      const isHovered = hoveredObject === obj.id;
      
      if (obj.type === 'point') {
        const p = graphToPixel(obj.x, obj.y);
        ctx.fillStyle = isSelected ? '#2563eb' : isHovered ? '#60a5fa' : obj.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, isSelected || isHovered ? 6 : 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (obj.label) {
          ctx.fillStyle = '#000';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(obj.label, p.x + 10, p.y - 10);
        }
      }
    });

    // Draw functions
    const params = {};
    Object.keys(parameters).forEach(key => {
      params[key] = parameters[key].value;
    });

    functions.forEach(func => {
      if (!func.visible || !func.expression.trim()) return;

      const funcBounds = {
        minX: pixelToGraph(0, 0).x,
        maxX: pixelToGraph(w, 0).x
      };
      const step = (funcBounds.maxX - funcBounds.minX) / w;

      ctx.strokeStyle = func.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      
      let started = false;
      for (let x = funcBounds.minX; x <= funcBounds.maxX; x += step) {
        const y = evaluateFunction(func.expression, x, params);
        if (y !== null && isFinite(y)) {
          const p = graphToPixel(x, y);
          if (p.y < -100 || p.y > h + 100) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    });
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setMousePos({ px, py });
    
    if (isDragging && dragStart) {
      if (draggedObject) {
        const obj = objects.find(o => o.id === draggedObject);
        if (obj && obj.type === 'point') {
          const graphPos = pixelToGraph(px, py);
          setObjects(objects.map(o => 
            o.id === draggedObject ? { ...o, x: snap(graphPos.x), y: snap(graphPos.y) } : o
          ));
        }
      } else {
        const dx = (px - dragStart.px) / viewport.scale;
        const dy = -(py - dragStart.py) / viewport.scale;
        setViewport(prev => ({
          ...prev,
          centerX: dragStart.centerX - dx,
          centerY: dragStart.centerY - dy
        }));
      }
    } else {
      const hoveredObj = getObjectAtPosition(px, py);
      setHoveredObject(hoveredObj ? hoveredObj.id : null);
    }
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const graphPos = pixelToGraph(px, py);
    const clickedObj = getObjectAtPosition(px, py);
    
    if (mode === 'select') {
      if (clickedObj) {
        if (!selectedObjects.includes(clickedObj.id)) {
          setSelectedObjects([clickedObj.id]);
        }
        if (clickedObj.type === 'point') {
          setIsDragging(true);
          setDraggedObject(clickedObj.id);
          setDragStart({ px, py, centerX: viewport.centerX, centerY: viewport.centerY });
        }
      } else {
        setSelectedObjects([]);
        setIsDragging(true);
        setDragStart({ px, py, centerX: viewport.centerX, centerY: viewport.centerY });
      }
    } else if (mode === 'point') {
      const id = nextId.current++;
      setObjects([...objects, {
        id,
        type: 'point',
        x: snap(graphPos.x),
        y: snap(graphPos.y),
        label: String.fromCharCode(64 + id),
        color: colors[objects.filter(o => o.type === 'point').length % colors.length],
        visible: true
      }]);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedObject(null);
    setDragStart(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setViewport(prev => ({
      ...prev,
      scale: Math.max(5, Math.min(200, prev.scale * factor))
    }));
  };

  const resetView = () => setViewport({ centerX: 0, centerY: 0, scale: 40 });
  const zoomIn = () => setViewport(prev => ({ ...prev, scale: Math.min(200, prev.scale * 1.3) }));
  const zoomOut = () => setViewport(prev => ({ ...prev, scale: Math.max(5, prev.scale / 1.3) }));

  const addFunction = () => {
    const newId = nextId.current++;
    setFunctions([...functions, {
      id: newId,
      expression: '',
      visible: true,
      color: colors[functions.length % colors.length]
    }]);
  };

  const updateFunction = (id, expression) => {
    setFunctions(functions.map(f => f.id === id ? { ...f, expression } : f));
  };

  const toggleFunction = (id) => {
    setFunctions(functions.map(f => f.id === id ? { ...f, visible: !f.visible } : f));
  };

  const removeFunction = (id) => {
    setFunctions(functions.filter(f => f.id !== id));
  };

  const updateParameter = (name, field, value) => {
    setParameters(prev => ({
      ...prev,
      [name]: { ...prev[name], [field]: parseFloat(value) }
    }));
  };

  return (
    <div className="h-screen bg-white text-gray-900 flex flex-col">
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-16 bg-gray-100 border-r border-gray-300 flex flex-col items-center py-4 gap-2">
          <button
            onClick={() => navigate('/')}
            className="p-3 rounded transition text-gray-700 hover:bg-gray-200 mb-4"
            title="Home"
          >
            <FiHome size={20} />
          </button>
          
          <div className="w-10 h-px bg-gray-300 mb-2" />
          
          <button
            onClick={() => setMode('select')}
            className={`p-3 rounded transition ${mode === 'select' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
            title="Select"
          >
            <FiMove size={20} />
          </button>
          <button
            onClick={() => setMode('point')}
            className={`p-3 rounded transition ${mode === 'point' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
            title="Point"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </aside>

        {showAlgebra && (
          <aside className="w-72 bg-gray-50 border-r border-gray-300 flex flex-col">
            <div className="p-3 border-b border-gray-300 bg-white flex items-center justify-between">
              <h3 className="font-semibold text-sm text-blue-600">Algebra View</h3>
              <button onClick={() => setShowAlgebra(false)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* Objects */}
              <div className="p-3 border-b border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Objects</h4>
                {objects.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No objects</p>
                ) : (
                  <div className="space-y-1">
                    {objects.map(obj => (
                      <div key={obj.id} className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer ${
                        selectedObjects.includes(obj.id) ? 'bg-blue-100' : 'hover:bg-gray-100'
                      }`} onClick={() => setSelectedObjects([obj.id])}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: obj.color }} />
                        <div className="flex-1">
                          <div className="font-semibold">{obj.label}</div>
                          <div className="text-xs text-gray-600">({obj.x.toFixed(2)}, {obj.y.toFixed(2)})</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Functions */}
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase">Functions</h4>
                  <button
                    onClick={addFunction}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    + Add
                  </button>
                </div>
                {functions.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No functions</p>
                ) : (
                  <div className="space-y-2">
                    {functions.map((func) => (
                      <div key={func.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={func.visible}
                          onChange={() => toggleFunction(func.id)}
                          className="w-4 h-4"
                        />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: func.color }} />
                        <input
                          type="text"
                          className="flex-1 bg-white border border-gray-300 px-2 py-1 rounded text-sm font-mono focus:outline-none focus:border-blue-400"
                          placeholder="e.g., sin(a*x)"
                          value={func.expression}
                          onChange={(e) => updateFunction(func.id, e.target.value)}
                        />
                        <button
                          onClick={() => removeFunction(func.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sliders */}
              {Object.keys(parameters).length > 0 && (
                <div className="p-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Sliders</h4>
                  <div className="space-y-4">
                    {Object.entries(parameters).map(([name, param]) => (
                      <div key={name} className="bg-white p-3 rounded border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold font-mono">{name}</label>
                          <span className="text-sm font-mono text-blue-600 font-semibold">{param.value.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step="0.01"
                          value={param.value}
                          onChange={(e) => updateParameter(name, 'value', e.target.value)}
                          className="w-full accent-blue-500"
                        />
                        <div className="flex gap-2 mt-2">
                          <input
                            type="number"
                            value={param.min}
                            onChange={(e) => updateParameter(name, 'min', e.target.value)}
                            className="w-20 bg-gray-50 border border-gray-300 px-2 py-1 rounded text-xs"
                            placeholder="min"
                          />
                          <input
                            type="number"
                            value={param.max}
                            onChange={(e) => updateParameter(name, 'max', e.target.value)}
                            className="w-20 bg-gray-50 border border-gray-300 px-2 py-1 rounded text-xs"
                            placeholder="max"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        <section className="flex-1 bg-white relative">
          <div className="absolute top-3 left-3 z-10 flex gap-2">
            {!showAlgebra && (
              <button onClick={() => setShowAlgebra(true)} className="bg-white border px-3 py-2 rounded shadow-sm hover:bg-gray-50 text-sm">
                Show Algebra
              </button>
            )}
            <div className="bg-white border rounded shadow-sm flex items-center gap-1 px-2">
              <button onClick={zoomOut} className="p-2 hover:bg-gray-100 rounded" title="Zoom Out">
                <FiZoomOut size={16} />
              </button>
              <button onClick={resetView} className="p-2 hover:bg-gray-100 rounded" title="Reset">
                <FiMaximize2 size={16} />
              </button>
              <button onClick={zoomIn} className="p-2 hover:bg-gray-100 rounded" title="Zoom In">
                <FiZoomIn size={16} />
              </button>
            </div>
            <label className="bg-white border px-3 py-2 rounded shadow-sm flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} className="w-4 h-4" />
              Grid
            </label>
          </div>

          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setHoveredObject(null)}
            onWheel={handleWheel}
          />
        </section>
      </main>
    </div>
  );
}
