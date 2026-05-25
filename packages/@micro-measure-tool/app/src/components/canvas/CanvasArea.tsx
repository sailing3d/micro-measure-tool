import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import { useGridStore } from "../../stores/gridStore";
import { useImagesStore } from "../../stores/imagesStore";
import { useCalibrationStore } from "../../stores/calibrationStore";
import { useToolStore } from "../../stores/toolStore";
import { useMeasurementsStore } from "../../stores/measurementsStore";
import { getTool } from "../../tools/registry";
import { copyImageToProject } from "../../services/projectService";
import GridLayer from "./GridLayer";
import ImageLayer from "./ImageLayer";
import ToolPreviewLayer from "./ToolPreviewLayer";
import type { Point } from "../../types";

const PADDING = 20;

export default function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const panX = useGridStore((s) => s.panX);
  const panY = useGridStore((s) => s.panY);
  const setPan = useGridStore((s) => s.setPan);
  const [scale, setScale] = useState(1);
  const rows = useGridStore((s) => s.rows);
  const cols = useGridStore((s) => s.cols);
  const cellWidth = useGridStore((s) => s.cellWidth);
  const cellHeight = useGridStore((s) => s.cellHeight);
  const addImage = useImagesStore((s) => s.addImage);
  const images = useImagesStore((s) => s.images);
  const calibrating = useCalibrationStore((s) => s.calibrating);
  const displayZoom = useCalibrationStore((s) => s.displayZoom);
  const ratio = useCalibrationStore((s) => s.ratio);
  const finishCalibrating = useCalibrationStore((s) => s.finishCalibrating);
  const activeToolId = useToolStore((s) => s.activeToolId);
  const addMeasurement = useMeasurementsStore((s) => s.addMeasurement);
  const measurements = useMeasurementsStore((s) => s.measurements);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const [, toolForce] = useState(0);

  const findImageAtPoint = useCallback(
    (stagePoint: Point): string | null => {
      for (const img of images) {
        const r = Math.floor(img.cellIndex / cols);
        const c = img.cellIndex % cols;
        const cx = c * cellWidth + PADDING + img.offsetX;
        const cy = r * cellHeight + PADDING + img.offsetY;
        if (
          stagePoint.x >= cx &&
          stagePoint.x <= cx + cellWidth * displayZoom * img.scale &&
          stagePoint.y >= cy &&
          stagePoint.y <= cy + cellHeight * displayZoom * img.scale
        ) {
          return img.id;
        }
      }
      return null;
    },
    [images, cols, cellWidth, cellHeight, displayZoom],
  );

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
        return;
      }
      if (e.evt.button === 0 && activeToolId) {
        const pos = stageRef.current?.getPointerPosition();
        if (!pos) return;
        const tool = getTool(activeToolId);
        if (!tool) return;
        const imageId = findImageAtPoint(pos);
        tool.onPointerDown(pos, imageId);
        toolForce((n) => n + 1);
      }
    },
    [panX, panY, calibrating, activeToolId, findImageAtPoint],
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
        calLineRef.current = { ...calLineRef.current, x2: pos.x, y2: pos.y };
        calForce((n) => n + 1);
        return;
      }
      if (activeToolId) {
        const pos = stageRef.current?.getPointerPosition();
        if (!pos) return;
        const tool = getTool(activeToolId);
        if (!tool) return;
        tool.onPointerMove(pos);
        toolForce((n) => n + 1);
      }
    },
    [setPan, calibrating, activeToolId],
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
      if (!displayZoom || dx === 0 && dy === 0) return;
      const pxLen = Math.sqrt(dx * dx + dy * dy) / displayZoom;
      const um = parseFloat(
        prompt(`线段像素长度: ${pxLen.toFixed(2)} px\n请输入实际微米长度:`) || "",
      );
      if (um > 0) finishCalibrating(um / pxLen);
      return;
    }
    if (activeToolId) {
      const pos = stageRef.current?.getPointerPosition();
      if (!pos) return;
      const tool = getTool(activeToolId);
      if (!tool) return;
      const result = tool.onPointerUp(pos);
      if (result) {
        const imageId = findImageAtPoint(pos) || "";
        const count = measurements.filter((m) => m.imageId === imageId).length;
        const calibrated = calibrateMeasurement(result, imageId, count + 1, ratio);
        addMeasurement(calibrated);
      }
      toolForce((n) => n + 1);
    }
  }, [calibrating, displayZoom, finishCalibrating, activeToolId, ratio, measurements, addMeasurement, findImageAtPoint]);

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
        col >= 0 && col < cols && row >= 0 && row < rows ? row * cols + col : -1;

      if (cellIdx < 0) return;

      const occupied = images.find((i) => i.cellIndex === cellIdx);
      if (occupied) return;

      const file = files[0];
      const folderHandle = (await import("../../services/projectService")).currentFolderHandle;
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

  const calLine = calLineRef.current;

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
        scaleX={scale}
        scaleY={scale}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={(e: Konva.KonvaEventObject<WheelEvent>) => {
          e.evt.preventDefault();
          const stage = stageRef.current;
          if (!stage) return;
          const oldScale = scale;
          const pointer = stage.getPointerPosition();
          if (!pointer) return;
          const factor = e.evt.deltaY > 0 ? 0.9 : 1.1;
          const newScale = Math.max(0.1, Math.min(5, oldScale * factor));
          const mousePointTo = {
            x: (pointer.x - panX) / oldScale,
            y: (pointer.y - panY) / oldScale,
          };
          setScale(newScale);
          setPan(
            pointer.x - mousePointTo.x * newScale,
            pointer.y - mousePointTo.y * newScale,
          );
        }}
      >
        <GridLayer
          selectedCellIndex={
            selectedId
              ? images.find((i) => i.id === selectedId)?.cellIndex ?? null
              : null
          }
        />
        <ImageLayer
          selectedId={selectedId}
          onSelectImage={setSelectedId}
        />
        <ToolPreviewLayer />
        {calibrating && (
          <Layer>
            <Line
              points={[calLine.x1, calLine.y1, calLine.x2, calLine.y2]}
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

function calibrateMeasurement(
  data: import("../../types").MeasurementData,
  imageId: string,
  seq: number,
  ratio: number,
): import("../../types").MeasurementData {
  const result = { ...data, imageId, name: `测量 ${seq}` };

  if (data.type === "h-line" && "lengthPx" in data.data) {
    result.data = {
      ...data.data,
      lengthUm: data.data.lengthPx * ratio,
    };
  } else if (data.type === "constrained-circle" && "radiusPx" in data.data) {
    result.data = {
      ...data.data,
      diameterUm: data.data.radiusPx * 2 * ratio,
    };
  }

  return result;
}
