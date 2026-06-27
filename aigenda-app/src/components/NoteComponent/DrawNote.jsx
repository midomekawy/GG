import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Pencil, Eraser, Shapes, Type, Undo2, Redo2, MousePointer2, LucideRectangleVertical, Circle, Triangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const DrawNote = () => {
  const canvasElementRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [activeTool, setActiveTool] = useState('pen');
  const [color, setColor] = useState('#8b5cf6'); 
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [showShapeMenu, setShowShapeMenu] = useState(false); 
  const historyRef = useRef([]);
  const historyStepRef = useRef(-1); 
  const isHistoryUpdate = useRef(false); 
  const [historyTrigger, setHistoryTrigger] = useState(0);
  
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }
    const canvas = new fabric.Canvas(canvasElementRef.current, {
      backgroundColor: '#ffffff',
      isDrawingMode: true,
    });

    fabricCanvasRef.current = canvas;
    const pencilBrush = new fabric.PencilBrush(canvas);
    pencilBrush.color = color;
    pencilBrush.width = strokeWidth;
    canvas.freeDrawingBrush = pencilBrush;
    saveHistory(canvas);

    canvas.on('object:added', () => saveHistory(canvas));
    canvas.on('object:modified', () => saveHistory(canvas));
    canvas.on('object:removed', () => saveHistory(canvas));

    const resizeObserver = new ResizeObserver((entries) => {
      if (fabricCanvasRef.current && entries[0]) {
        const { width, height } = entries[0].contentRect;
        
        fabricCanvasRef.current.setDimensions({ width, height });
        fabricCanvasRef.current.requestRenderAll();
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      resizeObserver.disconnect(); 
      canvas.dispose();
    };
  }, []); 

  const saveHistory = (canvas) => {
    if (isHistoryUpdate.current) return;
    
    const json = canvas.toJSON();
    const currentHistory = historyRef.current.slice(0, historyStepRef.current + 1);
    currentHistory.push(json);

    historyRef.current = currentHistory;
    historyStepRef.current = currentHistory.length - 1;
    setHistoryTrigger(prev => prev + 1); 
  };
  
  const handleUndo = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyStepRef.current <= 0) return;

    isHistoryUpdate.current = true; 
    historyStepRef.current -= 1; 

    canvas.loadFromJSON(historyRef.current[historyStepRef.current]).then(() => {
      canvas.requestRenderAll();
      isHistoryUpdate.current = false;
      setHistoryTrigger(prev => prev + 1);
    });
  };

  const handleRedo = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyStepRef.current >= historyRef.current.length - 1) return;

    isHistoryUpdate.current = true;
    historyStepRef.current += 1; 

    canvas.loadFromJSON(historyRef.current[historyStepRef.current]).then(() => {
      canvas.requestRenderAll();
      isHistoryUpdate.current = false;
      setHistoryTrigger(prev => prev + 1);
    });
  };
  const changeTool = (tool) => {
    setActiveTool(tool);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (tool === 'pen') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = strokeWidth;
    } else if (tool === 'eraser') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = '#ffffff';
      canvas.freeDrawingBrush.width = strokeWidth * 4;
    } else {
      canvas.isDrawingMode = false;
    }
  };
  const handleColorChange = (newColor) => {
    setColor(newColor);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (activeTool === 'pen') {
      canvas.freeDrawingBrush.color = newColor;
    }

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.type === 'i-text') {
        activeObject.set('fill', newColor);
      } else {
        activeObject.set('stroke', newColor);
      }
      canvas.requestRenderAll();
      saveHistory(canvas);
    }
  };
  const handleWidthChange = (width) => {
    setStrokeWidth(width);
    const canvas = fabricCanvasRef.current;
    
    if (canvas && activeTool === 'pen') {
      canvas.freeDrawingBrush.width = width;
    }
    
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type !== 'i-text') {
      activeObject.set('strokeWidth', width);
      canvas.requestRenderAll();
      saveHistory(canvas);
    }
  };

  const addShape = (type) => {
    const canvas = fabricCanvasRef.current;
    changeTool('select');
    setShowShapeMenu(false);

    let shape;
    const center = canvas.getCenter();
    const commonProps = {
      left: center.left, top: center.top,
      fill: 'transparent', stroke: color, strokeWidth: strokeWidth,
      originX: 'center', originY: 'center',
      cornerColor: '#8b5cf6', transparentCorners: false
    };

    if (type === 'rect') shape = new fabric.Rect({ ...commonProps, width: 100, height: 100 });
    if (type === 'circle') shape = new fabric.Circle({ ...commonProps, radius: 50 });
    if (type === 'triangle') shape = new fabric.Triangle({ ...commonProps, width: 100, height: 100 });

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
    }
  };
  const addText = () => {
    const canvas = fabricCanvasRef.current;
    changeTool('select');

    const text = new fabric.IText('Type here...', {
      left: 100, top: 100,
      fontFamily: 'sans-serif',
      fill: color,
      fontSize: 24,
      cornerColor: '#8b5cf6',
      transparentCorners: false
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
  };

  return (
  <div style={{ backgroundColor: '#f8f8f8', minHeight: '100vh', fontFamily: 'sans-serif', padding: '100px 20px 20px 20px' }}>      
      {/* header */}
      <div style={{
        position: 'fixed',
        top: 0,            
        left: 0,           
        width: '100%',     
        zIndex: 100,       
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        boxShadow: '0px 4px 6px rgba(0,0,0,0.3)',
        borderRadius: '0 0 10px 10px',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link to={'/workspacenotes'}>
           <div style={{ color: '#2610b2', backgroundColor: '#e0e3ef', borderRadius: '28px', width: '28px', height: '28px', alignItems: 'center', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} />
          </div>
          </Link>
          <p style={{ fontWeight: 'bold', margin: 0 }}>Tech Req</p>
          <p style={{ color: '#a9a9a9', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '10px' }}>●</span> New canva note
          </p>
        </div>
        
        <button style={{ 
          width: '120px', 
          backgroundColor: '#6918cf', 
          color: 'white', 
          border: 'none', 
          padding: '8px 16px', 
          borderRadius: '8px', 
          cursor: 'pointer',
          fontWeight: '500'
        }}>
          Save Note
        </button>
      </div>
      
      {/* --- Toolbar --- */}
      <div style={{
display: 'flex', 
  flexWrap: 'wrap',      // يسمح للأدوات تنزل سطر جديد لو الشاشة صغرت
  alignItems: 'center', 
  justifyContent: 'center', // يسنطر الأدوات جوه التول بار
  gap: '8px', 
  backgroundColor: 'white',
  padding: '10px',       // قللنا البادينج شوية
  borderRadius: '16px', 
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  width: '90%',          // ياخد عرض الشاشة المتاح
  maxWidth: 'max-content', // بس ميزيدش عن حجم محتواه في الشاشات الكبيرة
  position: 'fixed',
  top: '85px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000, 
  border: '1px solid #975fdd',
  boxSizing: 'border-box'
}}>
        <button onClick={() => changeTool('select')} style={btnStyle(activeTool === 'select')} title="Select Object">
          <MousePointer2 size={18} />
        </button>
        <button onClick={() => changeTool('pen')} style={btnStyle(activeTool === 'pen')}>
          <Pencil size={18} />
        </button>
        <button onClick={() => changeTool('eraser')} style={btnStyle(activeTool === 'eraser')}>
          <Eraser size={18} />
        </button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowShapeMenu(!showShapeMenu)} style={btnStyle(activeTool === 'shape' || showShapeMenu)}>
            <Shapes size={18} />
          </button>
          {showShapeMenu && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <button onClick={() => addShape('rect')} style={dropdownBtnStyle}><LucideRectangleVertical size={20}/> Rectangle</button>
              <button onClick={() => addShape('circle')} style={dropdownBtnStyle}><Circle size={20}/> Circle</button>
              <button onClick={() => addShape('triangle')} style={dropdownBtnStyle}><Triangle size={20}/> Triangle</button>
            </div>
          )}
        </div>
        <button onClick={addText} style={btnStyle(activeTool === 'text')}>
          <Type size={18} />
        </button>

        <div style={dividerStyle}></div>
        <button onClick={() => handleWidthChange(2)} style={dotBtnStyle(strokeWidth === 2, '20px')}>.</button>
        <button onClick={() => handleWidthChange(5)} style={dotBtnStyle(strokeWidth === 5, '28px')}>•</button>
        <button onClick={() => handleWidthChange(10)} style={dotBtnStyle(strokeWidth === 10, '36px')}>●</button>

        <div style={dividerStyle}></div>
        {['#0f172a', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map(c => (
          <button 
            key={c} onClick={() => handleColorChange(c)}
            style={{
              width: '24px', height: '24px', borderRadius: '50%', backgroundColor: c, border: 'none',
              cursor: 'pointer', boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
              margin: '0 4px', transition: 'all 0.2s'
            }}
          />
        ))}

        <div style={dividerStyle}></div>
        <button 
          onClick={handleUndo} 
          disabled={historyStepRef.current <= 0} 
          style={historyBtnStyle(historyStepRef.current <= 0)}
        >
          <Undo2 size={18} />
        </button>
        <button 
          onClick={handleRedo} 
          disabled={historyStepRef.current >= historyRef.current.length - 1} 
          style={historyBtnStyle(historyStepRef.current >= historyRef.current.length - 1)}
        >
          <Redo2 size={18} />
        </button>

      </div>
      <div 
      ref={containerRef}
      style={{ 
        border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', 
        backgroundColor: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
        width: '100%', margin: '0px auto',height:'949px'
      }}>
        <canvas ref={canvasElementRef} />
      </div>

    </div>
  );
};

const btnStyle = (isActive) => ({
  background: isActive ? '#f5f3ff' : 'transparent',
  color: isActive ? '#8b5cf6' : '#64748b',
  border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', transition: '0.2s'
});

const dropdownBtnStyle = {
  display: 'flex', alignItems: 'center', gap:'5px',background: 'none', border: 'none', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', color: '#475569', borderRadius: '4px'
};

const dotBtnStyle = (isActive, size) => ({
  background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: size,
  color: isActive ? '#0f172a' : '#94a3b8', lineHeight: '10px', padding: '0 4px'
});

const historyBtnStyle = (isDisabled) => ({
  background: 'none', border: 'none', padding: '8px', display: 'flex',
  color: isDisabled ? '#cbd5e1' : '#64748b', cursor: isDisabled ? 'not-allowed' : 'pointer'
});

const dividerStyle = { width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 8px' };

export default DrawNote;