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
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [showSliders, setShowSliders] = useState(false);
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
      // Check if it's an implicit equation (contains '=')
      if (expr.includes('=')) {
        const [left, right] = expr.split('=').map(s => s.trim());
        const rhs = math.parse(right).evaluate(params);
        
        // Circle: x^2 + y^2 = r^2
        if (left === 'x^2 + y^2') {
          const ySq = rhs - x * x;
          return ySq >= 0 ? Math.sqrt(ySq) : null;
        }
        
        // Ellipse: (x/a)^2 + (y/b)^2 = 1
        if (left.match(/\(x\/[a-z]\)\^2\s*\+\s*\(y\/[a-z]\)\^2/i)) {
          const aMatch = left.match(/\(x\/([a-z])\)/i);
          const bMatch = left.match(/\(y\/([a-z])\)/i);
          if (aMatch && bMatch) {
            const a = params[aMatch[1]] || 1;
            const b = params[bMatch[1]] || 1;
            const ySq = b * b * (1 - (x / a) ** 2);
            return ySq >= 0 ? Math.sqrt(ySq) : null;
          }
        }
        
        // Hyperbola: (x/a)^2 - (y/b)^2 = 1
        if (left.match(/\(x\/[a-z]\)\^2\s*-\s*\(y\/[a-z]\)\^2/i)) {
          const aMatch = left.match(/\(x\/([a-z])\)/i);
          const bMatch = left.match(/\(y\/([a-z])\)/i);
          if (aMatch && bMatch) {
            const a = params[aMatch[1]] || 1;
            const b = params[bMatch[1]] || 1;
            const ySq = b * b * ((x / a) ** 2 - 1);
            return ySq >= 0 ? Math.sqrt(ySq) : null;
          }
        }
      }
      
      // Regular function
      const scope = { x, ...params };
      const node = math.parse(expr);
      const result = node.evaluate(scope);
      return typeof result === 'number' && isFinite(result) ? result : null;
    } catch (e) {
      return null;
    }
  };

  const evaluateImplicit = (expr, x, y, params) => {
    try {
      if (!expr.includes('=')) return null;
      const [left, right] = expr.split('=').map(s => s.trim());
      const scope = { x, y, ...params };
      const leftVal = math.parse(left).evaluate(scope);
      const rightVal = math.parse(right).evaluate(scope);
      return leftVal - rightVal;
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
        // Remove spaces and parse
        const expr = func.expression.replace(/\s/g, '');
        // Extract single letters that are parameters (not x, y, or math functions)
        const matches = expr.match(/[a-z]/gi) || [];
        matches.forEach(sym => {
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
          updated[param] = { value: 2, min: -10, max: 10 };
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showShapesMenu && !e.target.closest('aside')) {
        setShowShapesMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShapesMenu]);

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
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, h);
    ctx.stroke();

    // Draw axis labels
    const gridSpacing = Math.pow(10, Math.floor(Math.log10(50 / viewport.scale)));
    const bounds = {
      minX: pixelToGraph(0, 0).x,
      maxX: pixelToGraph(w, 0).x,
      minY: pixelToGraph(0, h).y,
      maxY: pixelToGraph(0, 0).y
    };
    const startX = Math.floor(bounds.minX / gridSpacing) * gridSpacing;
    const startY = Math.floor(bounds.minY / gridSpacing) * gridSpacing;
    
    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // X-axis labels
    for (let x = startX; x <= bounds.maxX; x += gridSpacing) {
      if (Math.abs(x) < gridSpacing / 2) continue; // Skip 0
      const px = graphToPixel(x, 0).x;
      const py = origin.y;
      // Tick mark
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py - 5);
      ctx.lineTo(px, py + 5);
      ctx.stroke();
      // Label
      const label = Math.abs(x) < 0.01 ? '0' : (Math.abs(x) >= 1 ? x.toFixed(0) : x.toFixed(1));
      ctx.fillText(label, px, py + 8);
    }
    
    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = startY; y <= bounds.maxY; y += gridSpacing) {
      if (Math.abs(y) < gridSpacing / 2) continue; // Skip 0
      const px = origin.x;
      const py = graphToPixel(0, y).y;
      // Tick mark
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px - 5, py);
      ctx.lineTo(px + 5, py);
      ctx.stroke();
      // Label
      const label = Math.abs(y) < 0.01 ? '0' : (Math.abs(y) >= 1 ? y.toFixed(0) : y.toFixed(1));
      ctx.fillText(label, px - 8, py);
    }

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

      // Check if it's an implicit equation
      const isImplicit = func.expression.includes('=');

      ctx.strokeStyle = func.color;
      ctx.lineWidth = 2.5;

      if (isImplicit) {
        const expr = func.expression.trim();
        
        // Special cases with parametric equations for perfect shapes
        if (expr.startsWith('x^2 + y^2')) {
          // Circle: x^2 + y^2 = r^2
          try {
            const [left, right] = expr.split('=').map(s => s.trim());
            const rSquared = math.parse(right).evaluate(params);
            const r = Math.sqrt(rSquared);
            ctx.beginPath();
            const segments = 200;
            for (let i = 0; i <= segments; i++) {
              const t = (i / segments) * 2 * Math.PI;
              const x = r * Math.cos(t);
              const y = r * Math.sin(t);
              const p = graphToPixel(x, y);
              if (i === 0) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
          } catch (e) {
            // Fall back to general implicit rendering
          }
        }
        else if (expr.match(/\(x\/[a-z]\)\^2\s*\+\s*\(y\/[a-z]\)\^2/i)) {
          // Ellipse: (x/a)^2 + (y/b)^2 = 1
          try {
            const aMatch = expr.match(/\(x\/([a-z])\)/i);
            const bMatch = expr.match(/\(y\/([a-z])\)/i);
            if (aMatch && bMatch) {
              const a = params[aMatch[1]] || 2;
              const b = params[bMatch[1]] || 1;
              ctx.beginPath();
              const segments = 200;
              for (let i = 0; i <= segments; i++) {
                const t = (i / segments) * 2 * Math.PI;
                const x = a * Math.cos(t);
                const y = b * Math.sin(t);
                const p = graphToPixel(x, y);
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
              }
              ctx.stroke();
            }
          } catch (e) {
            // Fall back to general implicit rendering
          }
        }
        else if (expr.match(/\(x\/[a-z]\)\^2\s*-\s*\(y\/[a-z]\)\^2/i)) {
          // Hyperbola: (x/a)^2 - (y/b)^2 = 1
          try {
            const aMatch = expr.match(/\(x\/([a-z])\)/i);
            const bMatch = expr.match(/\(y\/([a-z])\)/i);
            if (aMatch && bMatch) {
              const a = params[aMatch[1]] || 2;
              const b = params[bMatch[1]] || 1;
              [-1, 1].forEach(sign => {
                ctx.beginPath();
                const tMin = -3;
                const tMax = 3;
                const segments = 100;
                for (let i = 0; i <= segments; i++) {
                  const t = tMin + (i / segments) * (tMax - tMin);
                  const x = sign * a * Math.cosh(t);
                  const y = b * Math.sinh(t);
                  const p = graphToPixel(x, y);
                  if (i === 0) ctx.moveTo(p.x, p.y);
                  else ctx.lineTo(p.x, p.y);
                }
                ctx.stroke();
              });
            }
          } catch (e) {
            // Fall back to general implicit rendering
          }
        }
        else if (expr.includes('(x^2 + y^2 - 1)^3') && expr.includes('x^2 * y^3')) {
          // Heart curve: (x^2 + y^2 - 1)^3 = x^2 * y^3
          // Using parametric form for efficiency
          ctx.beginPath();
          const segments = 300;
          for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * 2 * Math.PI;
            const x = (16 * Math.pow(Math.sin(t), 3)) / 16;
            const y = (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 16;
            const p = graphToPixel(x, y);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();
        }
        else {
          // General implicit equation using marching squares
          const bounds = {
            minX: pixelToGraph(0, 0).x,
            maxX: pixelToGraph(w, 0).x,
            minY: pixelToGraph(0, h).y,
            maxY: pixelToGraph(0, 0).y
          };
          
          // Adaptive grid size based on zoom level
          const gridSize = Math.max(0.05, 2 / viewport.scale);
          const threshold = 0.01;
          
          ctx.fillStyle = func.color;
          
          // Sample the implicit function on a grid
          for (let gx = bounds.minX; gx < bounds.maxX; gx += gridSize) {
            for (let gy = bounds.minY; gy < bounds.maxY; gy += gridSize) {
              const v00 = evaluateImplicit(expr, gx, gy, params);
              const v10 = evaluateImplicit(expr, gx + gridSize, gy, params);
              const v01 = evaluateImplicit(expr, gx, gy + gridSize, params);
              const v11 = evaluateImplicit(expr, gx + gridSize, gy + gridSize, params);
              
              if (v00 === null || v10 === null || v01 === null || v11 === null) continue;
              
              // Check if the cell contains a zero crossing
              const signs = [v00, v10, v01, v11].map(v => Math.sign(v));
              const hasZeroCrossing = signs.some((s, i) => signs.some((s2, j) => i !== j && s !== s2));
              
              if (hasZeroCrossing || Math.abs(v00) < threshold) {
                const px = graphToPixel(gx + gridSize/2, gy + gridSize/2);
                ctx.fillRect(px.x - 1, px.y - 1, 2, 2);
              }
            }
          }
        }
      } else {
        // Regular function
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
      }
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
    // Check for point notation: a = (x, y)
    const pointMatch = expression.match(/^([a-zA-Z])\s*=\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)$/);
    if (pointMatch) {
      const label = pointMatch[1];
      const x = parseFloat(pointMatch[2]);
      const y = parseFloat(pointMatch[3]);
      
      // Check if a point with this label already exists
      const existingPoint = objects.find(o => o.type === 'point' && o.label === label);
      if (existingPoint) {
        // Update existing point
        setObjects(objects.map(o => 
          o.id === existingPoint.id ? { ...o, x, y } : o
        ));
      } else {
        // Create new point
        const newPointId = nextId.current++;
        setObjects([...objects, {
          id: newPointId,
          type: 'point',
          x,
          y,
          label,
          color: colors[objects.filter(o => o.type === 'point').length % colors.length],
          visible: true
        }]);
      }
      
      // Remove this function entry and add a new empty one
      const updatedFunctions = functions.filter(f => f.id !== id);
      if (updatedFunctions.length === 0 || updatedFunctions[updatedFunctions.length - 1].expression.trim() !== '') {
        const newId = nextId.current++;
        updatedFunctions.push({
          id: newId,
          expression: '',
          visible: true,
          color: colors[updatedFunctions.length % colors.length]
        });
      }
      setFunctions(updatedFunctions);
      return;
    }
    
    // Parse function notation shortcuts
    let parsedExpr = expression;
    
    // circle(r) -> x^2 + y^2 = r^2
    const circleMatch = expression.match(/^circle\s*\(\s*([^)]+)\s*\)$/i);
    if (circleMatch) {
      const r = circleMatch[1].trim();
      parsedExpr = `x^2 + y^2 = (${r})^2`;
    }
    
    // ellipse(a, b) -> (x/a)^2 + (y/b)^2 = 1
    const ellipseMatch = expression.match(/^ellipse\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)$/i);
    if (ellipseMatch) {
      const a = ellipseMatch[1].trim();
      const b = ellipseMatch[2].trim();
      parsedExpr = `(x/(${a}))^2 + (y/(${b}))^2 = 1`;
    }
    
    // heart -> (x^2 + y^2 - 1)^3 = x^2 * y^3
    if (expression.match(/^heart$/i)) {
      parsedExpr = '(x^2 + y^2 - 1)^3 = x^2 * y^3';
    }
    
    // hyperbola(a, b) -> (x/a)^2 - (y/b)^2 = 1
    const hyperbolaMatch = expression.match(/^hyperbola\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)$/i);
    if (hyperbolaMatch) {
      const a = hyperbolaMatch[1].trim();
      const b = hyperbolaMatch[2].trim();
      parsedExpr = `(x/(${a}))^2 - (y/(${b}))^2 = 1`;
    }
    
    setFunctions(functions.map(f => f.id === id ? { ...f, expression: parsedExpr } : f));
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

  const addPresetFunction = (type) => {
    const id = nextId.current++;
    let expressions = [];
    
    switch(type) {
      case 'circle':
        expressions = [
          { expr: 'x^2 + y^2 = r^2', desc: 'Circle' }
        ];
        break;
      case 'ellipse':
        expressions = [
          { expr: '(x/a)^2 + (y/b)^2 = 1', desc: 'Ellipse' }
        ];
        break;
      case 'hyperbola':
        expressions = [
          { expr: '(x/a)^2 - (y/b)^2 = 1', desc: 'Hyperbola' }
        ];
        break;
      case 'parabola':
        expressions = [{ expr: 'a*x^2', desc: 'Parabola' }];
        break;
      case 'heart':
        expressions = [{ expr: '(x^2 + y^2 - 1)^3 = x^2 * y^3', desc: 'Heart' }];
        break;
      case 'sine':
        expressions = [{ expr: 'a*sin(b*x)', desc: 'Sine wave' }];
        break;
      case 'cosine':
        expressions = [{ expr: 'a*cos(b*x)', desc: 'Cosine wave' }];
        break;
    }
    
    const newFuncs = expressions.map((e, i) => ({
      id: nextId.current++,
      expression: e.expr,
      visible: true,
      color: colors[(functions.length + i) % colors.length]
    }));
    
    setFunctions([...functions, ...newFuncs]);
    setShowShapesMenu(false);
  };

  return (
    <div className="h-screen bg-white text-gray-900 flex flex-col">
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-16 bg-gray-100 border-r border-gray-300 flex flex-col items-center py-4 gap-2 relative">
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

          <div className="relative">
            <button
              onClick={() => setShowShapesMenu(!showShapesMenu)}
              className="p-3 rounded transition text-gray-700 hover:bg-gray-200"
              title="Shapes"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="8" />
              </svg>
            </button>

            {showShapesMenu && (
              <div className="absolute left-full ml-2 top-0 bg-white border border-gray-300 rounded-lg shadow-lg py-2 w-40 z-50">
                <button
                  onClick={() => addPresetFunction('circle')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm flex items-center gap-2"
                >
                  <span>○</span> Circle
                </button>
                <button
                  onClick={() => addPresetFunction('ellipse')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm flex items-center gap-2"
                >
                  <span>⬭</span> Ellipse
                </button>
                <button
                  onClick={() => addPresetFunction('hyperbola')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm flex items-center gap-2"
                >
                  <span>⟩⟨</span> Hyperbola
                </button>
                <button
                  onClick={() => addPresetFunction('parabola')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm flex items-center gap-2"
                >
                  <span>⌒</span> Parabola
                </button>
                <button
                  onClick={() => addPresetFunction('heart')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm flex items-center gap-2"
                >
                  <span>♥</span> Heart
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => addPresetFunction('sine')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm flex items-center gap-2"
                >
                  <span>∿</span> Sine
                </button>
                <button
                  onClick={() => addPresetFunction('cosine')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm flex items-center gap-2"
                >
                  <span>∿</span> Cosine
                </button>
              </div>
            )}
          </div>
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
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Functions</h4>
                <div className="space-y-2">
                  {functions.map((func, idx) => (
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
                        placeholder="e.g., a=(2,3), sin(x), circle(5), heart"
                        value={func.expression}
                        onChange={(e) => {
                          updateFunction(func.id, e.target.value);
                          // Add a new empty function if this is the last one and it has content
                          if (idx === functions.length - 1 && e.target.value.trim()) {
                            addFunction();
                          }
                        }}
                      />
                      <button
                        onClick={() => removeFunction(func.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {functions.length === 0 && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={true}
                        className="w-4 h-4"
                        disabled
                      />
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <input
                        type="text"
                        className="flex-1 bg-white border border-gray-300 px-2 py-1 rounded text-sm font-mono focus:outline-none focus:border-blue-400"
                        placeholder="e.g., a=(2,3), sin(x), circle(5), heart"
                        onFocus={addFunction}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Sliders */}
              {Object.keys(parameters).length > 0 && (
                <div className="p-3">
                  <button
                    onClick={() => setShowSliders(!showSliders)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase mb-2 hover:text-gray-700"
                  >
                    <span>Sliders ({Object.keys(parameters).length})</span>
                    <span>{showSliders ? '▼' : '▶'}</span>
                  </button>
                  {showSliders && (
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
                  )}
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
