import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import { useGridStore } from "../../stores/gridStore";
import { useImagesStore } from "../../stores/imagesStore";
import { useCalibrationStore } from "../../stores/calibrationStore";
import { copyImageToProject } from "../../services/projectService";
import GridLayer from "./GridLayer";
import ImageLayer from "./ImageLayer";

const PADDING = 20;

export default function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const panX = useGridStore((s) => s.panX);
  const panY = useGridStore((s) => s.panY);
  const setPan = useGridStore((s) => s.setPan);
  const { rows, cols, cellWidth, cellHeight } = useGridStore((s) => ({
    rows: s.rows,
    cols: s.cols,
    cellWidth: s.cellWidth,
    cellHeight: s.cellHeight,
  }));
  const addImage = useImagesStore((s) => s.addImage);
  const images = useImagesStore((s) => s.images);
  const calibrating = useCalibrationStore((s) => s.calibrating);
  const displayZoom = useCalibrationStore((s) => s.displayZoom);
  const finishCalibrating = useCalibrationStore((s) => s.finishCalibrating);

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

  const calDrawing = useRef(false);
  const calLineRef = useRef({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const [, calForce] = useState(0);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.button === 2) {
        e.evt.preventDefault();
        isPanning.current = true;
        panStart.current = { x: e.evt.clientX, y: e.evt.clientY, panX, panY };
        return;
      }
      if (e.evt.button === 0 && calibrating) {
        const pos = stageRef.current?.getPointerPosition();
        if (!pos) return;
        calDrawing.current = true;
        calLineRef.current = { x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
        calForce((n) => n + 1);
      }
    },
    [panX, panY, calibrating],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (isPanning.current) {
        const dx = e.evt.clientX - panStart.current.x;
        const dy = e.evt.clientY - panStart.current.y;
        setPan(panStart.current.panX + dx, panStart.current.panY + dy);
        return;
      }
      if (calDrawing.current && calibrating) {
        const pos = stageRef.current?.getPointerPosition();
        if (!pos) return;
        calLineRef.current = {
          ...calLineRef.current,
          x2: pos.x,
          y2: pos.y,
        };
        calForce((n) => n + 1);
      }
    },
    [setPan, calibrating],
  );

  const handleMouseUp = useCallback(() => {
    if (isPanning.current) {
      isPanning.current = false;
      return;
    }
    if (calDrawing.current && calibrating) {
      calDrawing.current = false;
      const { x1, y1, x2, y2 } = calLineRef.current;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const pxLen = Math.sqrt(dx * dx + dy * dy) / displayZoom;
      const um = parseFloat(
        prompt(`线段像素长度: ${pxLen.toFixed(2)} px\n请输入实际微米长度:`) || "",
      );
      if (um > 0) {
        finishCalibrating(um / pxLen);
      }
    }
  }, [calibrating, displayZoom, finishCalibrating]);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      const rect = containerRef.current!.getBoundingClientRect();
      const stageX = e.clientX - rect.left - panX;
      const stageY = e.clientY - rect.top - panY;
      const col = Math.floor((stageX - PADDING) / cellWidth);
      const row = Math.floor((stageY - PADDING) / cellHeight);
      const cellIdx =
        col >= 0 && col < cols && row >= 0 && row < rows
          ? row * cols + col
          : -1;

      if (cellIdx < 0) return;

      const occupied = images.find((i) => i.cellIndex === cellIdx);
      if (occupied) return;

      const file = files[0];
      const folderHandle = (await import("../../services/projectService"))
        .currentFolderHandle;
      if (!folderHandle) return;

      const filename = await copyImageToProject(file, folderHandle);
      const url = URL.createObjectURL(file);

      addImage({
        id: `img-${Date.now()}`,
        filename,
        filepath: url,
        cellIndex: cellIdx,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        scale: 1,
      });
    },
    [panX, panY, cellWidth, cellHeight, cols, rows, images, addImage],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const calline = calLineRef.current;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden bg-gray-950"
      onContextMenu={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        x={panX}
        y={panY}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <GridLayer />
        <ImageLayer />
        {calibrating && (
          <Layer>
            <Line
              points={[calline.x1, calline.y1, calline.x2, calline.y2]}
              stroke="#3b82f6"
              strokeWidth={2}
              dash={[6, 3]}
            />
          </Layer>
        )}
      </Stage>
    </div>
  );
}
