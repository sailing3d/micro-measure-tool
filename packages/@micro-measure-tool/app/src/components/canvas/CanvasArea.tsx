import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer } from "react-konva";
import { useGridStore } from "../../stores/gridStore";
import GridLayer from "./GridLayer";

export default function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const panX = useGridStore((s) => s.panX);
  const panY = useGridStore((s) => s.panY);
  const setPan = useGridStore((s) => s.setPan);

  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const handleMouseDown = useCallback(
    (e: { evt: MouseEvent }) => {
      if (e.evt.button === 2) {
        e.evt.preventDefault();
        isPanning.current = true;
        panStart.current = {
          x: e.evt.clientX,
          y: e.evt.clientY,
          panX,
          panY,
        };
      }
    },
    [panX, panY],
  );

  const handleMouseMove = useCallback(
    (e: { evt: MouseEvent }) => {
      if (!isPanning.current) return;
      const dx = e.evt.clientX - panStart.current.x;
      const dy = e.evt.clientY - panStart.current.y;
      setPan(panStart.current.panX + dx, panStart.current.panY + dy);
    },
    [setPan],
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden bg-gray-950"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Stage
        width={size.width}
        height={size.height}
        x={panX}
        y={panY}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <GridLayer />
        <Layer />
      </Stage>
    </div>
  );
}
