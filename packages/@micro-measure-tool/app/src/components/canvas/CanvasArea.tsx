import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer } from "react-konva";
import { useGridStore } from "../../stores/gridStore";
import { useImagesStore } from "../../stores/imagesStore";
import { copyImageToProject } from "../../services/projectService";
import GridLayer from "./GridLayer";
import ImageLayer from "./ImageLayer";

const PADDING = 20;

export default function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null);
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
        panStart.current = { x: e.evt.clientX, y: e.evt.clientY, panX, panY };
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

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden bg-gray-950"
      onContextMenu={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
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
        <ImageLayer />
        <Layer />
      </Stage>
    </div>
  );
}
