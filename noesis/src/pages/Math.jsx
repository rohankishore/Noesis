import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/Header';
import { create, all } from 'mathjs';
import { FiZoomIn, FiZoomOut, FiMaximize2, FiMove, FiCircle, FiSlash, FiSquare } from 'react-icons/fi';
import { TbPoint, TbLine, TbPolygon, TbRuler, TbAngle } from 'react-icons/tb';

const math = create(all);

const colors = [
  '#3b82f6', '#ef4444', '#22c55e', '#a78bfa', '#f97316', 
  '#ec4899', '#eab308', '#06b6d4', '#8b5cf6', '#f59e0b'
];

export default function Math() {
  const canvasRef = useRef(null);
  
  // GeoGebra-like state
  const [mode, setMode] = useState('select'); // select, point, line, circle, polygon, distance, angle
  const [objects, setObjects] = useState([]);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [tempConstruction, setTempConstruction] = useState(null);
  
  // Functions (graphing mode)
  const [functions, setFunctions] = useState([]);
  const [parameters, setParameters] = useState({});
  
  // View state
  const [viewport, setViewport] = useState({ 
    centerX: 0, 
    centerY: 0, 
    scale: 40 
  });
  const [mousePos, setMousePos] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedObject, setDraggedObject] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [redrawTrigger, setRedrawTrigger] = useState(0);
  const [showAlgebra, setShowAlgebra] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  
  const nextId = useRef(1);

  // Extract parameters from all functions
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

    // Add new parameters with default values
    setParameters(prev => {
      const updated = { ...prev };
      allParams.forEach(param => {
        if (!(param in updated)) {
          updated[param] = { value: 1, min: -10, max: 10 };
        }
      });
      // Remove unused parameters
      Object.keys(updated).forEach(param => {
        if (!allParams.has(param)) {
          delete updated[param];
        }
      });
      return updated;
    });
  }, [functions]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      setRedrawTrigger(prev => prev + 1);
    };

    const timeoutId = setTimeout(resizeCanvas, 0);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    draw();
  }, [functions, parameters, viewport, tools, tangentPoint, cursorPoint, redrawTrigger]);

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

  const derivative = (expr, x, params, h = 0.0001) => {
    const y1 = evaluateFunction(expr, x - h, params);
    const y2 = evaluateFunction(expr, x + h, params);
    if (y1 === null || y2 === null) return null;
    return (y2 - y1) / (2 * h);
  };

  const findCriticalPoints = (expr, params) => {
    const points = [];
    const canvas = canvasRef.current;
    if (!canvas) return points;

    const { x: minX } = pixelToGraph(0, 0);
    const { x: maxX } = pixelToGraph(canvas.width, 0);
    const step = (maxX - minX) / 500;

    let prevDeriv = derivative(expr, minX, params);
    
    for (let x = minX + step; x <= maxX; x += step) {
      const deriv = derivative(expr, x, params);
      if (deriv !== null && prevDeriv !== null) {
        // Sign change in derivative = critical point
        if ((prevDeriv > 0 && deriv < 0) || (prevDeriv < 0 && deriv > 0)) {
          const y = evaluateFunction(expr, x, params);
          if (y !== null) {
            points.push({ x, y, type: prevDeriv > 0 ? 'max' : 'min' });
          }
        }
      }
      prevDeriv = deriv;
    }
    
    return points;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    // Grid
    if (tools.showGrid) {
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      
      const gridSpacing = Math.pow(10, Math.floor(Math.log10(50 / viewport.scale)));
      const actualSpacing = gridSpacing * viewport.scale;
      
      const { x: minX } = pixelToGraph(0, 0);
      const { x: maxX } = pixelToGraph(w, 0);
      const { y: minY } = pixelToGraph(0, h);
      const { y: maxY } = pixelToGraph(0, 0);
      
      const startX = Math.floor(minX / gridSpacing) * gridSpacing;
      const startY = Math.floor(minY / gridSpacing) * gridSpacing;
      
      for (let x = startX; x <= maxX; x += gridSpacing) {
        const px = graphToPixel(x, 0).x;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, h);
        ctx.stroke();
      }
      
      for (let y = startY; y <= maxY; y += gridSpacing) {
        const py = graphToPixel(0, y).y;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
        ctx.stroke();
      }
    }

    // Axes
    if (tools.showAxes) {
      const origin = graphToPixel(0, 0);
      
      // X-axis
      ctx.strokeStyle = '#404040';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, origin.y);
      ctx.lineTo(w, origin.y);
      ctx.stroke();
      
      // Y-axis
      ctx.beginPath();
      ctx.moveTo(origin.x, 0);
      ctx.lineTo(origin.x, h);
      ctx.stroke();
      
      // Axis labels
      ctx.fillStyle = '#737373';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      
      const { x: minX } = pixelToGraph(0, 0);
      const { x: maxX } = pixelToGraph(w, 0);
      const labelSpacing = Math.pow(10, Math.floor(Math.log10((maxX - minX) / 10)));
      
      for (let x = Math.ceil(minX / labelSpacing) * labelSpacing; x <= maxX; x += labelSpacing) {
        if (Math.abs(x) < labelSpacing / 2) continue;
        const px = graphToPixel(x, 0).x;
        ctx.fillText(x.toFixed(1), px, origin.y + 15);
      }
      
      ctx.textAlign = 'right';
      const { y: minY } = pixelToGraph(0, h);
      const { y: maxY } = pixelToGraph(0, 0);
      
      for (let y = Math.ceil(minY / labelSpacing) * labelSpacing; y <= maxY; y += labelSpacing) {
        if (Math.abs(y) < labelSpacing / 2) continue;
        const py = graphToPixel(0, y).y;
        ctx.fillText(y.toFixed(1), origin.x - 10, py + 4);
      }
    }

    // Plot functions
    const params = {};
    Object.keys(parameters).forEach(key => {
      params[key] = parameters[key].value;
    });

    functions.forEach(func => {
      if (!func.visible || !func.expression.trim()) return;

      const { x: minX } = pixelToGraph(0, 0);
      const { x: maxX } = pixelToGraph(w, 0);
      const step = (maxX - minX) / w;

      // Plot main function
      ctx.strokeStyle = func.color.main;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      
      let started = false;
      for (let x = minX; x <= maxX; x += step) {
        const y = evaluateFunction(func.expression, x, params);
        if (y !== null) {
          const p = graphToPixel(x, y);
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

      // Plot derivative
      if (tools.showDerivative && func.id === selectedFunction) {
        ctx.strokeStyle = func.color.light;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        
        started = false;
        for (let x = minX; x <= maxX; x += step) {
          const dy = derivative(func.expression, x, params);
          if (dy !== null) {
            const p = graphToPixel(x, dy);
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
        ctx.setLineDash([]);
      }

      // Plot integral (area under curve)
      if (tools.showIntegral && func.id === selectedFunction && cursorPoint) {
        ctx.fillStyle = func.color.main + '30';
        ctx.beginPath();
        
        const startX = Math.min(0, cursorPoint.x);
        const endX = Math.max(0, cursorPoint.x);
        const integralStep = (endX - startX) / 100;
        
        const startP = graphToPixel(startX, 0);
        ctx.moveTo(startP.x, startP.y);
        
        for (let x = startX; x <= endX; x += integralStep) {
          const y = evaluateFunction(func.expression, x, params);
          if (y !== null) {
            const p = graphToPixel(x, y);
            ctx.lineTo(p.x, p.y);
          }
        }
        
        const endP = graphToPixel(endX, 0);
        ctx.lineTo(endP.x, endP.y);
        ctx.closePath();
        ctx.fill();
      }

      // Show critical points
      if (tools.showCriticalPoints && func.id === selectedFunction) {
        const criticalPoints = findCriticalPoints(func.expression, params);
        criticalPoints.forEach(point => {
          const p = graphToPixel(point.x, point.y);
          ctx.fillStyle = point.type === 'max' ? '#22c55e' : '#ef4444';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
    });

    // Draw tangent line
    if (tools.showTangent && tangentPoint && selectedFunction) {
      const func = functions.find(f => f.id === selectedFunction);
      if (func) {
        const slope = derivative(func.expression, tangentPoint.x, params);
        if (slope !== null) {
          const y0 = evaluateFunction(func.expression, tangentPoint.x, params);
          if (y0 !== null) {
            const { x: minX } = pixelToGraph(0, 0);
            const { x: maxX } = pixelToGraph(w, 0);
            
            const y1 = slope * (minX - tangentPoint.x) + y0;
            const y2 = slope * (maxX - tangentPoint.x) + y0;
            
            const p1 = graphToPixel(minX, y1);
            const p2 = graphToPixel(maxX, y2);
            
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Point on curve
            const p = graphToPixel(tangentPoint.x, y0);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }
    }

    // Draw cursor point
    if (cursorPoint && selectedFunction) {
      const func = functions.find(f => f.id === selectedFunction);
      if (func) {
        const y = evaluateFunction(func.expression, cursorPoint.x, params);
        if (y !== null) {
          const p = graphToPixel(cursorPoint.x, y);
          
          // Crosshair
          ctx.strokeStyle = '#ffffff40';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(p.x, 0);
          ctx.lineTo(p.x, h);
          ctx.moveTo(0, p.y);
          ctx.lineTo(w, p.y);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Point
          ctx.fillStyle = func.color.main;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
          ctx.fill();
          
          // Label
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(`(${cursorPoint.x.toFixed(2)}, ${y.toFixed(2)})`, p.x + 10, p.y - 10);
        }
      }
    }
  };

  // Mouse handlers
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    
    setMousePos({ px, py });
    
    if (isDragging && dragStart) {
      const dx = (px - dragStart.px) / viewport.scale;
      const dy = -(py - dragStart.py) / viewport.scale;
      setViewport(prev => ({
        ...prev,
        centerX: dragStart.centerX - dx,
        centerY: dragStart.centerY - dy
      }));
    } else if (selectedFunction) {
      const graphPos = pixelToGraph(px, py);
      setCursorPoint(graphPos);
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 0 && e.shiftKey) {
      // Shift+click for tangent
      if (selectedFunction && cursorPoint) {
        setTangentPoint(cursorPoint);
      }
    } else if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      // Middle click or Ctrl+click to pan
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      setIsDragging(true);
      setDragStart({
        px: e.clientX - rect.left,
        py: e.clientY - rect.top,
        centerX: viewport.centerX,
        centerY: viewport.centerY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setViewport(prev => ({
      ...prev,
      scale: Math.max(1, Math.min(200, prev.scale * factor))
    }));
  };

  const handleMouseLeave = () => {
    setCursorPoint(null);
    setIsDragging(false);
  };

  // Function management
  const addFunction = () => {
    const newId = Math.max(0, ...functions.map(f => f.id)) + 1;
    setFunctions([...functions, {
      id: newId,
      expression: '',
      visible: true,
      color: colors[functions.length % colors.length]
    }]);
  };

  const updateFunction = (id, expression) => {
    setFunctions(functions.map(f => 
      f.id === id ? { ...f, expression } : f
    ));
  };

  const toggleFunction = (id) => {
    setFunctions(functions.map(f => 
      f.id === id ? { ...f, visible: !f.visible } : f
    ));
  };

  const removeFunction = (id) => {
    setFunctions(functions.filter(f => f.id !== id));
    if (selectedFunction === id) {
      setSelectedFunction(null);
      setTangentPoint(null);
    }
  };

  const updateParameter = (name, field, value) => {
    setParameters(prev => ({
      ...prev,
      [name]: { ...prev[name], [field]: parseFloat(value) }
    }));
  };

  const resetView = () => {
    setViewport({ centerX: 0, centerY: 0, scale: 40 });
  };

  const zoomIn = () => {
    setViewport(prev => ({ ...prev, scale: Math.min(200, prev.scale * 1.2) }));
  };

  const zoomOut = () => {
    setViewport(prev => ({ ...prev, scale: Math.max(1, prev.scale / 1.2) }));
  };

  return (
    <div className="h-screen bg-neutral-950 text-neutral-200 flex flex-col">
      <Header />

      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Controls */}
        <aside className="w-80 border-r border-neutral-800 overflow-y-auto">
            {/* Functions */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wide">Functions</h3>
                <button
                  onClick={addFunction}
                  className="text-xs text-neutral-400 hover:text-purple-400 transition"
                >
                  + Add
                </button>
              </div>
              
              <div className="space-y-2">
                {functions.map((func, idx) => (
                  <div key={func.id} className="group">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={func.visible}
                        onChange={() => toggleFunction(func.id)}
                        className="w-4 h-4 accent-purple-500"
                      />
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: func.color.main }}
                      />
                      <input
                        type="text"
                        className={`flex-1 bg-neutral-900 border ${
                          selectedFunction === func.id ? 'border-purple-500' : 'border-neutral-700'
                        } focus:border-purple-500 px-3 py-2 rounded text-sm font-mono focus:outline-none`}
                        placeholder="e.g., sin(a*x)"
                        value={func.expression}
                        onChange={(e) => updateFunction(func.id, e.target.value)}
                        onFocus={() => setSelectedFunction(func.id)}
                      />
                      <button
                        onClick={() => removeFunction(func.id)}
                        className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parameters */}
            {Object.keys(parameters).length > 0 && (
              <div className="p-4 border-b border-neutral-800">
                <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wide mb-3">Parameters</h3>
                <div className="space-y-4">
                  {Object.entries(parameters).map(([name, param]) => (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-mono">{name}</label>
                        <span className="text-sm text-purple-400 font-mono">{param.value.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step="0.1"
                        value={param.value}
                        onChange={(e) => updateParameter(name, 'value', e.target.value)}
                        className="w-full accent-purple-500"
                      />
                      <div className="flex gap-2 mt-1">
                        <input
                          type="number"
                          value={param.min}
                          onChange={(e) => updateParameter(name, 'min', e.target.value)}
                          className="w-16 bg-neutral-900 border border-neutral-700 px-2 py-1 rounded text-xs"
                          placeholder="min"
                        />
                        <input
                          type="number"
                          value={param.max}
                          onChange={(e) => updateParameter(name, 'max', e.target.value)}
                          className="w-16 bg-neutral-900 border border-neutral-700 px-2 py-1 rounded text-xs"
                          placeholder="max"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tools */}
            <div className="p-4 border-b border-neutral-800">
              <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wide mb-3">Tools</h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2 cursor-pointer hover:text-purple-400 transition">
                  <input
                    type="checkbox"
                    checked={tools.showGrid}
                    onChange={(e) => setTools({...tools, showGrid: e.target.checked})}
                    className="w-4 h-4 accent-purple-500"
                  />
                  Show Grid
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-purple-400 transition">
                  <input
                    type="checkbox"
                    checked={tools.showAxes}
                    onChange={(e) => setTools({...tools, showAxes: e.target.checked})}
                    className="w-4 h-4 accent-purple-500"
                  />
                  Show Axes
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-purple-400 transition">
                  <input
                    type="checkbox"
                    checked={tools.showDerivative}
                    onChange={(e) => setTools({...tools, showDerivative: e.target.checked})}
                    className="w-4 h-4 accent-purple-500"
                    disabled={!selectedFunction}
                  />
                  Show Derivative (f')
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-purple-400 transition">
                  <input
                    type="checkbox"
                    checked={tools.showIntegral}
                    onChange={(e) => setTools({...tools, showIntegral: e.target.checked})}
                    className="w-4 h-4 accent-purple-500"
                    disabled={!selectedFunction}
                  />
                  Show Integral (Area)
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-purple-400 transition">
                  <input
                    type="checkbox"
                    checked={tools.showTangent}
                    onChange={(e) => {
                      setTools({...tools, showTangent: e.target.checked});
                      if (!e.target.checked) setTangentPoint(null);
                    }}
                    className="w-4 h-4 accent-purple-500"
                    disabled={!selectedFunction}
                  />
                  Show Tangent Line
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-purple-400 transition">
                  <input
                    type="checkbox"
                    checked={tools.showCriticalPoints}
                    onChange={(e) => setTools({...tools, showCriticalPoints: e.target.checked})}
                    className="w-4 h-4 accent-purple-500"
                    disabled={!selectedFunction}
                  />
                  Show Critical Points
                </label>
              </div>
              
              {tools.showTangent && selectedFunction && (
                <p className="text-xs text-neutral-500 mt-3">
                  Shift+Click on graph to place tangent line
                </p>
              )}
            </div>

            {/* View Controls */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wide mb-3">View</h3>
              <div className="flex gap-2">
                <button
                  onClick={zoomIn}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 p-2 rounded transition flex items-center justify-center gap-2"
                >
                  <FiZoomIn /> Zoom In
                </button>
                <button
                  onClick={zoomOut}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 p-2 rounded transition flex items-center justify-center gap-2"
                >
                  <FiZoomOut /> Zoom Out
                </button>
              </div>
              <button
                onClick={resetView}
                className="w-full bg-neutral-800 hover:bg-neutral-700 p-2 rounded transition mt-2 flex items-center justify-center gap-2"
              >
                <FiMaximize2 /> Reset View
              </button>
              
              <div className="mt-3 text-xs text-neutral-500 space-y-1">
                <p>• Scroll to zoom</p>
                <p>• Ctrl+Drag to pan</p>
                <p>• Click function to select</p>
              </div>
            </div>
          </aside>

          {/* Main Canvas */}
          <section className="flex-1 bg-gradient-to-br from-neutral-900 to-black relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
              onContextMenu={(e) => e.preventDefault()}
            />
            
            {/* Info overlay */}
            <div className="absolute top-4 right-4 bg-neutral-900/90 backdrop-blur border border-neutral-700 rounded-lg px-4 py-2 text-xs font-mono">
              <div>Scale: {viewport.scale.toFixed(1)}x</div>
              <div>Center: ({viewport.centerX.toFixed(2)}, {viewport.centerY.toFixed(2)})</div>
            </div>
          </section>
        </main>
    </div>
  );
}
