import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

const DrawingPreview = ({ drawingData }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !drawingData) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: '#ffffff',
      selection: false,
      isDrawingMode: false,
    });
    fabricCanvasRef.current = canvas;

    try {
      const json = typeof drawingData === 'string' ? JSON.parse(drawingData) : drawingData;
      canvas.loadFromJSON(json).then(() => {
        canvas.requestRenderAll();
      });
    } catch (err) {
      console.error('Error loading drawing preview:', err);
    }

    return () => {
      canvas.dispose();
    };
  }, [drawingData]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={150}
      style={{ width: '100%', height: '150px', background: '#fff', borderRadius: '8px' }}
    />
  );
};

export default DrawingPreview;
