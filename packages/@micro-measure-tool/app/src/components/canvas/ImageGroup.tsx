import { useRef, useCallback, useEffect } from "react";
import {
  Group,
  Image as KonvaImage,
  Transformer,
  Rect,
  Text,
} from "react-konva";
import Konva from "konva";
import { useGridStore } from "../../stores/gridStore";
import { useImagesStore } from "../../stores/imagesStore";
import { useCalibrationStore } from "../../stores/calibrationStore";
import type { ImageData } from "../../types";

const PADDING = 20;

interface Props {
  imageData: ImageData;
  imageElement: HTMLImageElement;
  isSelected: boolean;
  onDragHoverCellChange: (cellIndex: number | null) => void;
  onSelect: () => void;
  draggableLocked: boolean;
}

export default function ImageGroup({
  imageData,
  imageElement,
  isSelected,
  onDragHoverCellChange,
  onSelect,
  draggableLocked,
}: Props) {
  const cellWidth = useGridStore((s) => s.cellWidth);
  const cellHeight = useGridStore((s) => s.cellHeight);
  const cols = useGridStore((s) => s.cols);
  const rows = useGridStore((s) => s.rows);
  const displayZoom = useCalibrationStore((s) => s.displayZoom);
  const updateImage = useImagesStore((s) => s.updateImage);
  const removeImage = useImagesStore((s) => s.removeImage);
  const images = useImagesStore((s) => s.images);
  const moveImageToCell = useImagesStore((s) => s.moveImageToCell);

  const imgGroupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  const r = Math.floor(imageData.cellIndex / cols);
  const c = imageData.cellIndex % cols;
  const cellX = c * cellWidth + PADDING;
  const cellY = r * cellHeight + PADDING;

  const imgW = imageElement.naturalWidth * displayZoom;
  const imgH = imageElement.naturalHeight * displayZoom;
  const visW = imgW * imageData.scale;
  const visH = imgH * imageData.scale;

  // Local center in cell coordinates (parent group is already translated to cellX/cellY).
  const localCenterX = imageData.offsetX + imgW / 2;
  const localCenterY = imageData.offsetY + imgH / 2;

  const handleDragMove = useCallback(() => {
    const node = imgGroupRef.current;
    if (!node) return;
    const stage = node.getStage();
    const pos = stage ? node.getAbsolutePosition(stage) : { x: cellX + node.x(), y: cellY + node.y() };
    const nc = Math.floor((pos.x - PADDING) / cellWidth);
    const nr = Math.floor((pos.y - PADDING) / cellHeight);
    const ni = nr * cols + nc;
    const inRange = ni >= 0 && ni < rows * cols;
    if (!inRange || ni === imageData.cellIndex) {
      onDragHoverCellChange(null);
      return;
    }
    onDragHoverCellChange(ni);
  }, [imageData.cellIndex, cellWidth, cellHeight, cols, rows, cellX, cellY, onDragHoverCellChange]);

  const handleDragEnd = useCallback(() => {
    onDragHoverCellChange(null);
    const node = imgGroupRef.current;
    if (!node) return;
    // Use stage-local coordinates (ignore Stage pan/zoom screen transform).
    const stage = node.getStage();
    const pos = stage ? node.getAbsolutePosition(stage) : { x: cellX + node.x(), y: cellY + node.y() };
    const nx = Math.round(pos.x);
    const ny = Math.round(pos.y);
    const nc = Math.floor((nx - PADDING) / cellWidth);
    const nr = Math.floor((ny - PADDING) / cellHeight);
    const ni = nr * cols + nc;

    if (ni >= 0 && ni < rows * cols && ni !== imageData.cellIndex) {
      const tgt = images.find((i) => i.cellIndex === ni);
      if (tgt) {
        moveImageToCell(tgt.id, imageData.cellIndex, tgt.offsetX, tgt.offsetY);
      }
      const newCellX = nc * cellWidth + PADDING;
      const newCellY = nr * cellHeight + PADDING;
      moveImageToCell(imageData.id, ni,
        Math.round(nx - imgW / 2 - newCellX),
        Math.round(ny - imgH / 2 - newCellY));
    } else {
      updateImage(imageData.id, {
        offsetX: Math.round(nx - imgW / 2 - cellX),
        offsetY: Math.round(ny - imgH / 2 - cellY),
      });
    }
  }, [imageData, cellWidth, cellHeight, cols, rows, cellX, cellY, imgW, imgH, updateImage, moveImageToCell, images, onDragHoverCellChange]);

  const handleTransformEnd = useCallback(() => {
    const node = imgGroupRef.current;
    if (!node) return;
    // Transformer already reports the final absolute node scale.
    const nextScale = Math.max(0.01, node.scaleX());
    const nextRotation = Math.round(node.rotation());
    // Keep transformer interaction stable: persist scale, then normalize node scale.
    node.scaleX(1);
    node.scaleY(1);
    updateImage(imageData.id, { scale: nextScale, rotation: nextRotation });
  }, [imageData, updateImage]);

  useEffect(() => {
    if (isSelected && trRef.current && imgGroupRef.current) {
      trRef.current.nodes([imgGroupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Group x={cellX} y={cellY}
        clipX={0} clipY={0} clipWidth={cellWidth} clipHeight={cellHeight}>
        <Group ref={imgGroupRef}
          x={localCenterX} y={localCenterY}
          draggable={!draggableLocked}
          rotation={imageData.rotation}
          scaleX={imageData.scale} scaleY={imageData.scale}
          onClick={onSelect} onTap={onSelect}
          onDragStart={() => onDragHoverCellChange(null)}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}>
          <KonvaImage image={imageElement}
            width={imgW} height={imgH}
            offsetX={imgW / 2} offsetY={imgH / 2} />
        </Group>
      </Group>

      {isSelected && (
        <>
          <Transformer ref={trRef}
            centeredScaling
            enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
            boundBoxFunc={(_oldBox, newBox) => {
              if (visW <= 0 || visH <= 0) return newBox;
              const ratio = visW / visH;
              const w = Math.max(20, newBox.width);
              return { ...newBox, width: w, height: w / ratio };
            }} />
          <Rect x={cellX + cellWidth - 48} y={cellY + 2}
            width={22} height={18} fill="#ef4444" cornerRadius={3}
            onClick={() => removeImage(imageData.id)}
            onTap={() => removeImage(imageData.id)} />
          <Text x={cellX + cellWidth - 46} y={cellY + 4}
            text="x" fontSize={10} fill="#fff" listening={false} />
          <Rect x={cellX + cellWidth - 24} y={cellY + 2}
            width={22} height={18} fill="#4b5563" cornerRadius={3}
            onClick={() => updateImage(imageData.id, {
              offsetX: Math.round((cellWidth - imgW) / 2),
              offsetY: Math.round((cellHeight - imgH) / 2),
              rotation: 0,
              scale: 1,
            })}
            onTap={() => updateImage(imageData.id, {
              offsetX: Math.round((cellWidth - imgW) / 2),
              offsetY: Math.round((cellHeight - imgH) / 2),
              rotation: 0,
              scale: 1,
            })} />
          <Text x={cellX + cellWidth - 22} y={cellY + 4}
            text="0" fontSize={10} fill="#fff" listening={false} />
        </>
      )}
    </>
  );
}
