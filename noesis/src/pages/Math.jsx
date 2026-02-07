import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/Header';
import { create, all } from 'mathjs';
import { FiZoomIn, FiZoomOut, FiMaximize2, FiMove, FiCircle, FiSlash, FiSquare, FiMinus } from 'react-icons/fi';
import { BiCircle } from 'react-icons/bi';

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

  // Utility functions
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

  const distance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const pointDistance = (p1, p2) => {
    return distance(p1.x, p1.y, p2.x, p2.y);
  };

  const getObjectAtPosition = (px, py, tolerance = 10) => {
    const graphPos = pixelToGraph(px, py);
    
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (!obj.visible) continue;
      
      if (obj.type === 'point') {
        const screenPos = graphToPixel(obj.x, obj.y);
        if (distance(px, py, screenPos.x, screenPos.y) < tolerance) {
          return obj;
        }
      } else if (obj.type === 'line' || obj.type === 'segment') {
        const p1 = getPoint(obj.p1);
        const p2 = getPoint(obj.p2);
        if (!p1 || !p2) continue;
        
        const dist = distanceToSegment(graphPos, p1, p2, obj.type === 'line');
        if (dist < tolerance / viewport.scale) {
          return obj;
        }
      } else if (obj.type === 'circle') {
        const center = getPoint(obj.center);
        if (!center) continue;
        
        const r = obj.radius;
        const d = pointDistance(graphPos, center);
        if (Math.abs(d - r) < tolerance / viewport.scale) {
          return obj;
        }
      }
    }
    return null;
  };

  const getPoint = (id) => {
    const obj = objects.find(o => o.id === id && o.type === 'point');
    return obj || null;
  };

  const distanceToSegment = (p, p1, p2, isInfiniteLine = false) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lenSq = dx * dx + dy * dy;
    
    if (lenSq === 0) return pointDistance(p, p1);
    
    let t = ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / lenSq;
    
    if (!isInfiniteLine) {
      t = Math.max(0, Math.min(1, t));
    }
    
    const closest = {
      x: p1.x + t * dx,
      y: p1.y + t * dy
    };
    
    return pointDistance(p, closest);
  };

  // Canvas setup and drawing
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
  }, [objects, functions, parameters, viewport, showGrid, hoveredObject, selectedObjects, tempConstruction, redrawTrigger]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, w, h);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 1;
      
      const gridSpacing = Math.pow(10, Math.floor(Math.log10(50 / viewport.scale)));
      
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
    
    // Axis labels
    ctx.fillStyle = '#888';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    
    const { x: axisMinX } = pixelToGraph(0, 0);
    const { x: axisMaxX } = pixelToGraph(w, 0);
    const labelSpacing = Math.pow(10, Math.floor(Math.log10((axisMaxX - axisMinX) / 10)));
    
    for (let x = Math.ceil(axisMinX / labelSpacing) * labelSpacing; x <= axisMaxX; x += labelSpacing) {
      if (Math.abs(x) < labelSpacing / 2) continue;
      const px = graphToPixel(x, 0).x;
      ctx.fillText(x.toFixed(labelSpacing < 1 ? 1 : 0), px, origin.y + 15);
    }
    
    ctx.textAlign = 'right';
    const { y: axisMinY } = pixelToGraph(0, h);
    const { y: axisMaxY } = pixelToGraph(0, 0);
    
    for (let y = Math.ceil(axisMinY / labelSpacing) * labelSpacing; y <= axisMaxY; y += labelSpacing) {
      if (Math.abs(y) < labelSpacing / 2) continue;
      const py = graphToPixel(0, y).y;
      ctx.fillText(y.toFixed(labelSpacing < 1 ? 1 : 0), origin.x - 8, py + 4);
    }

    // Draw functions
    const params = {};
    Object.keys(parameters).forEach(key => {
      params[key] = parameters[key].value;
    });

    functions.forEach(func => {
      if (!func.visible || !func.expression.trim()) return;

      const { x: minX } = pixelToGraph(0, 0);
      const { x: maxX } = pixelToGraph(w, 0);
      const step = (maxX - minX) / w;

      ctx.strokeStyle = func.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let started = false;
      for (let x = minX; x <= maxX; x += step) {
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

    // Draw geometric objects
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
        
        // Label
        if (obj.label) {
          ctx.fillStyle = '#000';
          ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(obj.label, p.x + 10, p.y - 10);
        }
      } else if (obj.type === 'line' || obj.type === 'segment') {
        const p1 = getPoint(obj.p1);
        const p2 = getPoint(obj.p2);
        if (!p1 || !p2) return;
        
        ctx.strokeStyle = isSelected ? '#2563eb' : isHovered ? '#60a5fa' : obj.color;
        ctx.lineWidth = isSelected || isHovered ? 3 : 2;
        ctx.beginPath();
        
        if (obj.type === 'line') {
          // Extend to canvas edges
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len === 0) return;
          
          const dirX = dx / len;
          const dirY = dy / len;
          const ext = Math.max(w, h) * 2;
          
          const start = graphToPixel(p1.x - dirX * ext, p1.y - dirY * ext);
          const end = graphToPixel(p1.x + dirX * ext, p1.y + dirY * ext);
          
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
        } else {
          const start = graphToPixel(p1.x, p1.y);
          const end = graphToPixel(p2.x, p2.y);
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
        }
        ctx.stroke();
        
        if (obj.label) {
          const mid = graphToPixel((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          ctx.fillText(obj.label, mid.x + 5, mid.y - 5);
        }
      } else if (obj.type === 'circle') {
        const center = getPoint(obj.center);
        if (!center) return;
        
        const centerPx = graphToPixel(center.x, center.y);
        const radiusPx = obj.radius * viewport.scale;
        
        ctx.strokeStyle = isSelected ? '#2563eb' : isHovered ? '#60a5fa' : obj.color;
        ctx.lineWidth = isSelected || isHovered ? 3 : 2;
        ctx.beginPath();
        ctx.arc(centerPx.x, centerPx.y, radiusPx, 0, 2 * Math.PI);
        ctx.stroke();
        
        if (obj.label) {
          ctx.fillStyle = '#000';
          ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          ctx.fillText(obj.label, centerPx.x + radiusPx + 5, centerPx.y);
        }
      } else if (obj.type === 'polygon') {
        if (obj.points.length < 2) return;
        
        ctx.strokeStyle = isSelected ? '#2563eb' : isHovered ? '#60a5fa' : obj.color;
        ctx.fillStyle = obj.color + '20';
        ctx.lineWidth = isSelected || isHovered ? 3 : 2;
        ctx.beginPath();
        
        obj.points.forEach((pid, i) => {
          const p = getPoint(pid);
          if (!p) return;
          const px = graphToPixel(p.x, p.y);
          if (i === 0) {
            ctx.moveTo(px.x, px.y);
          } else {
            ctx.lineTo(px.x, px.y);
          }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (obj.type === 'distance') {
        const p1 = getPoint(obj.p1);
        const p2 = getPoint(obj.p2);
        if (!p1 || !p2) return;
        
        const start = graphToPixel(p1.x, p1.y);
        const end = graphToPixel(p2.x, p2.y);
        const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
        
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        const dist = pointDistance(p1, p2);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(dist.toFixed(2), mid.x, mid.y - 8);
      }
    });

    // Draw temporary construction
    if (tempConstruction && mousePos) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      
      if (tempConstruction.type === 'line' && tempConstruction.p1) {
        const p1 = getPoint(tempConstruction.p1);
        if (p1) {
          const start = graphToPixel(p1.x, p1.y);
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(mousePos.px, mousePos.py);
          ctx.stroke();
        }
      } else if (tempConstruction.type === 'circle' && tempConstruction.center) {
        const center = getPoint(tempConstruction.center);
        if (center) {
          const centerPx = graphToPixel(center.x, center.y);
          const graphMouse = pixelToGraph(mousePos.px, mousePos.py);
          const radius = pointDistance(center, graphMouse);
          const radiusPx = radius * viewport.scale;
          ctx.beginPath();
          ctx.arc(centerPx.x, centerPx.y, radiusPx, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
      
      ctx.setLineDash([]);
    }

    // Draw mode cursor
    if (mousePos && mode === 'point') {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mousePos.px, mousePos.py, 5, 0, 2 * Math.PI);
      ctx.stroke();
    }
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

  // Mouse handlers
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    
    setMousePos({ px, py });
    
    if (isDragging && dragStart) {
      if (draggedObject) {
        // Dragging an object (point)
        const obj = objects.find(o => o.id === draggedObject);
        if (obj && obj.type === 'point') {
          const graphPos = pixelToGraph(px, py);
          setObjects(objects.map(o => 
            o.id === draggedObject 
              ? { ...o, x: snap(graphPos.x), y: snap(graphPos.y) }
              : o
          ));
        }
      } else {
        // Panning viewport
        const dx = (px - dragStart.px) / viewport.scale;
        const dy = -(py - dragStart.py) / viewport.scale;
        setViewport(prev => ({
          ...prev,
          centerX: dragStart.centerX - dx,
          centerY: dragStart.centerY - dy
        }));
      }
    } else {
      // Hover detection
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
    
    // Check if clicking on an existing object
    const clickedObj = getObjectAtPosition(px, py);
    
    if (mode === 'select') {
      if (clickedObj) {
        if (e.shiftKey) {
          // Multi-select
          setSelectedObjects(prev => 
            prev.includes(clickedObj.id)
              ? prev.filter(id => id !== clickedObj.id)
              : [...prev, clickedObj.id]
          );
        } else {
          if (!selectedObjects.includes(clickedObj.id)) {
            setSelectedObjects([clickedObj.id]);
          }
          
          // Start dragging if it's a point
          if (clickedObj.type === 'point') {
            setIsDragging(true);
            setDraggedObject(clickedObj.id);
            setDragStart({ px, py, centerX: viewport.centerX, centerY: viewport.centerY });
          }
        }
      } else {
        // Clicked empty space - start panning
        setSelectedObjects([]);
        setIsDragging(true);
        setDragStart({ px, py, centerX: viewport.centerX, centerY: viewport.centerY });
      }
    } else if (mode === 'point') {
      // Create point
      const id = nextId.current++;
      const newPoint = {
        id,
        type: 'point',
        x: snap(graphPos.x),
        y: snap(graphPos.y),
        label: String.fromCharCode(64 + id),
        color: colors[objects.filter(o => o.type === 'point').length % colors.length],
        visible: true
      };
      setObjects([...objects, newPoint]);
    } else if (mode === 'line' || mode === 'segment') {
      if (!tempConstruction) {
        // First click - select start point
        if (clickedObj && clickedObj.type === 'point') {
          setTempConstruction({ type: mode, p1: clickedObj.id });
        } else {
          // Create point at click location
          const id = nextId.current++;
          const newPoint = {
            id,
            type: 'point',
            x: snap(graphPos.x),
            y: snap(graphPos.y),
            label: String.fromCharCode(64 + id),
            color: colors[objects.filter(o => o.type === 'point').length % colors.length],
            visible: true
          };
          setObjects(prev => [...prev, newPoint]);
          setTempConstruction({ type: mode, p1: id });
        }
      } else {
        // Second click - create line/segment
        let p2Id;
        if (clickedObj && clickedObj.type === 'point') {
          p2Id = clickedObj.id;
        } else {
          const id = nextId.current++;
          const newPoint = {
            id,
            type: 'point',
            x: snap(graphPos.x),
            y: snap(graphPos.y),
            label: String.fromCharCode(64 + id),
            color: colors[objects.filter(o => o.type === 'point').length % colors.length],
            visible: true
          };
          setObjects(prev => [...prev, newPoint]);
          p2Id = id;
        }
        
        const id = nextId.current++;
        const newLine = {
          id,
          type: mode,
          p1: tempConstruction.p1,
          p2: p2Id,
          label: mode === 'line' ? 'l' : 's',
          color: colors[id % colors.length],
          visible: true
        };
        setObjects(prev => [...prev, newLine]);
        setTempConstruction(null);
      }
    } else if (mode === 'circle') {
      if (!tempConstruction) {
        // First click - select center
        if (clickedObj && clickedObj.type === 'point') {
          setTempConstruction({ type: 'circle', center: clickedObj.id });
        } else {
          const id = nextId.current++;
          const newPoint = {
            id,
            type: 'point',
            x: snap(graphPos.x),
            y: snap(graphPos.y),
            label: String.fromCharCode(64 + id),
            color: colors[objects.filter(o => o.type === 'point').length % colors.length],
            visible: true
          };
          setObjects(prev => [...prev, newPoint]);
          setTempConstruction({ type: 'circle', center: id });
        }
      } else {
        // Second click - create circle
        const center = getPoint(tempConstruction.center);
        if (center) {
          const radius = pointDistance(center, graphPos);
          const id = nextId.current++;
          const newCircle = {
            id,
            type: 'circle',
            center: tempConstruction.center,
            radius,
            label: 'c',
            color: colors[id % colors.length],
            visible: true
          };
          setObjects(prev => [...prev, newCircle]);
          setTempConstruction(null);
        }
      }
    } else if (mode === 'distance') {
      if (!tempConstruction) {
        if (clickedObj && clickedObj.type === 'point') {
          setTempConstruction({ type: 'distance', p1: clickedObj.id });
        }
      } else {
        if (clickedObj && clickedObj.type === 'point' && clickedObj.id !== tempConstruction.p1) {
          const id = nextId.current++;
          const newDist = {
            id,
            type: 'distance',
            p1: tempConstruction.p1,
            p2: clickedObj.id,
            color: colors[id % colors.length],
            visible: true
          };
          setObjects(prev => [...prev, newDist]);
        }
        setTempConstruction(null);
      }
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

  const handleMouseLeave = () => {
    setHoveredObject(null);
    setMousePos(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setTempConstruction(null);
      setMode('select');
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedObjects.length > 0) {
        // Remove selected objects and dependent objects
        const toRemove = new Set(selectedObjects);
        
        // Find dependent objects
        objects.forEach(obj => {
          if (obj.type === 'line' || obj.type === 'segment' || obj.type === 'distance') {
            if (toRemove.has(obj.p1) || toRemove.has(obj.p2)) {
              toRemove.add(obj.id);
            }
          } else if (obj.type === 'circle') {
            if (toRemove.has(obj.center)) {
              toRemove.add(obj.id);
            }
          } else if (obj.type === 'polygon') {
            if (obj.points.some(pid => toRemove.has(pid))) {
              toRemove.add(obj.id);
            }
          }
        });
        
        setObjects(objects.filter(o => !toRemove.has(o.id)));
        setSelectedObjects([]);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjects, objects]);

  // Utility functions
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
    setFunctions(functions.map(f => 
      f.id === id ? { ...f, expression } : f
    ));
  };

  const toggleVisibility = (id) => {
    setObjects(objects.map(obj =>
      obj.id === id ? { ...obj, visible: !obj.visible } : obj
    ));
  };

  const resetView = () => {
    setViewport({ centerX: 0, centerY: 0, scale: 40 });
  };

  const zoomIn = () => {
    setViewport(prev => ({ ...prev, scale: Math.min(200, prev.scale * 1.3) }));
  };

  const zoomOut = () => {
    setViewport(prev => ({ ...prev, scale: Math.max(5, prev.scale / 1.3) }));
  };

  const clearAll = () => {
    if (confirm('Clear all objects?')) {
      setObjects([]);
      setSelectedObjects([]);
      setTempConstruction(null);
    }
  };

  const getObjectDescription = (obj) => {
    if (obj.type === 'point') {
      return `(${obj.x.toFixed(2)}, ${obj.y.toFixed(2)})`;
    } else if (obj.type === 'line') {
      return `Line through ${getPoint(obj.p1)?.label || ''} and ${getPoint(obj.p2)?.label || ''}`;
    } else if (obj.type === 'segment') {
      const p1 = getPoint(obj.p1);
      const p2 = getPoint(obj.p2);
      if (p1 && p2) {
        const dist = pointDistance(p1, p2);
        return `Segment, length = ${dist.toFixed(2)}`;
      }
      return 'Segment';
    } else if (obj.type === 'circle') {
      return `Circle, r = ${obj.radius.toFixed(2)}`;
    } else if (obj.type === 'distance') {
      const p1 = getPoint(obj.p1);
      const p2 = getPoint(obj.p2);
      if (p1 && p2) {
        return `Distance = ${pointDistance(p1, p2).toFixed(2)}`;
      }
      return 'Distance';
    }
    return obj.type;
  };

  return (
    <div className="h-screen bg-white text-gray-900 flex flex-col">
      <Header />

      <main className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <aside className="w-16 bg-gray-100 border-r border-gray-300 flex flex-col items-center py-4 gap-2">
          <button
            onClick={() => { setMode('select'); setTempConstruction(null); }}
            className={`p-3 rounded transition ${
              mode === 'select' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            title="Select (Esc)"
          >
            <FiMove size={20} />
          </button>
          
          <button
            onClick={() => { setMode('point'); setTempConstruction(null); }}
            className={`p-3 rounded transition ${
              mode === 'point' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            title="Point"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          
          <button
            onClick={() => { setMode('line'); setTempConstruction(null); }}
            className={`p-3 rounded transition ${
              mode === 'line' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            title="Line"
          >
            <FiMinus size={20} />
          </button>
          
          <button
            onClick={() => { setMode('segment'); setTempConstruction(null); }}
            className={`p-3 rounded transition ${
              mode === 'segment' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            title="Segment"
          >
            <FiSlash size={20} />
          </button>
          
          <button
            onClick={() => { setMode('circle'); setTempConstruction(null); }}
            className={`p-3 rounded transition ${
              mode === 'circle' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            title="Circle"
          >
            <FiCircle size={20} />
          </button>
          
          <button
            onClick={() => { setMode('distance'); setTempConstruction(null); }}
            className={`p-3 rounded transition ${
              mode === 'distance' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            title="Distance"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="8" x2="3" y2="16" />
              <line x1="21" y1="8" x2="21" y2="16" />
            </svg>
          </button>

          <div className="flex-1" />
          
          <button
            onClick={clearAll}
            className="p-3 text-gray-700 hover:bg-red-100 hover:text-red-600 rounded transition"
            title="Clear All"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </aside>

        {/* Algebra View */}
        {showAlgebra && (
          <aside className="w-72 bg-gray-50 border-r border-gray-300 flex flex-col">
            <div className="p-3 border-b border-gray-300 bg-white flex items-center justify-between">
              <h3 className="font-semibold text-sm text-blue-600">Algebra View</h3>
              <button
                onClick={() => setShowAlgebra(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {/* Objects */}
              <div className="p-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Objects</h4>
                {objects.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No objects created</p>
                ) : (
                  <div className="space-y-1">
                    {objects.map(obj => (
                      <div
                        key={obj.id}
                        className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer transition ${
                          selectedObjects.includes(obj.id)
                            ? 'bg-blue-100 border border-blue-300'
                            : hoveredObject === obj.id
                            ? 'bg-gray-100'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedObjects([obj.id])}
                      >
                        <input
                          type="checkbox"
                          checked={obj.visible}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleVisibility(obj.id);
                          }}
                          className="w-4 h-4"
                        />
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: obj.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{obj.label || `Object ${obj.id}`}</div>
                          <div className="text-xs text-gray-600 truncate">
                            {getObjectDescription(obj)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Functions */}
              {functions.length > 0 && (
                <div className="p-3 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Functions</h4>
                  <div className="space-y-2">
                    {functions.map((func, idx) => (
                      <div key={func.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={func.visible}
                          onChange={() => {
                            setFunctions(functions.map(f =>
                              f.id === func.id ? { ...f, visible: !f.visible } : f
                            ));
                          }}
                          className="w-4 h-4"
                        />
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: func.color }}
                        />
                        <input
                          type="text"
                          className="flex-1 bg-white border border-gray-300 px-2 py-1 rounded text-sm font-mono focus:outline-none focus:border-blue-400"
                          placeholder="f(x) ="
                          value={func.expression}
                          onChange={(e) => updateFunction(func.id, e.target.value)}
                        />
                        <button
                          onClick={() => setFunctions(functions.filter(f => f.id !== func.id))}
                          className="text-gray-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={addFunction}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 py-2 border border-dashed border-blue-300 rounded hover:bg-blue-50 transition"
                >
                  + Add Function
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Main Canvas */}
        <section className="flex-1 bg-white relative flex flex-col">
          {/* Top controls */}
          <div className="absolute top-3 left-3 z-10 flex gap-2">
            {!showAlgebra && (
              <button
                onClick={() => setShowAlgebra(true)}
                className="bg-white border border-gray-300 px-3 py-2 rounded shadow-sm hover:bg-gray-50 transition text-sm"
              >
                Show Algebra
              </button>
            )}
            
            <div className="bg-white border border-gray-300 rounded shadow-sm flex items-center gap-1 px-2">
              <button
                onClick={zoomOut}
                className="p-2 hover:bg-gray-100 rounded transition"
                title="Zoom Out"
              >
                <FiZoomOut size={16} />
              </button>
              <button
                onClick={resetView}
                className="p-2 hover:bg-gray-100 rounded transition"
                title="Reset View"
              >
                <FiMaximize2 size={16} />
              </button>
              <button
                onClick={zoomIn}
                className="p-2 hover:bg-gray-100 rounded transition"
                title="Zoom In"
              >
                <FiZoomIn size={16} />
              </button>
            </div>

            <label className="bg-white border border-gray-300 px-3 py-2 rounded shadow-sm flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition text-sm">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4"
              />
              Grid
            </label>

            <label className="bg-white border border-gray-300 px-3 py-2 rounded shadow-sm flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition text-sm">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                className="w-4 h-4"
              />
              Snap
            </label>
          </div>

          {/* Info overlay */}
          <div className="absolute top-3 right-3 bg-white border border-gray-300 rounded shadow-sm px-3 py-2 text-xs font-mono z-10">
            <div className="text-gray-600">Zoom: {viewport.scale.toFixed(0)}x</div>
            {mousePos && (
              <div className="text-gray-600">
                ({pixelToGraph(mousePos.px, mousePos.py).x.toFixed(2)}, {pixelToGraph(mousePos.px, mousePos.py).y.toFixed(2)})
              </div>
            )}
          </div>

          {/* Instructions */}
          {tempConstruction && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-10">
              {tempConstruction.type === 'line' || tempConstruction.type === 'segment' 
                ? 'Click to place second point'
                : tempConstruction.type === 'circle'
                ? 'Click to set radius'
                : tempConstruction.type === 'distance'
                ? 'Click second point to measure'
                : 'Click to continue'}
            </div>
          )}

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
        </section>
      </main>
    </div>
  );
}
