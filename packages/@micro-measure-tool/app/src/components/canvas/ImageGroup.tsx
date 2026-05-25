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
  onSelect: () => void;
}

export default function ImageGroup({
  imageData,
  imageElement,
  isSelected,
  onSelect,
}: Props) {
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const cellWidth = useGridStore((s) => s.cellWidth);
  const cellHeight = useGridStore((s) => s.cellHeight);
  const cols = useGridStore((s) => s.cols);
  const rows = useGridStore((s) => s.rows);
  const displayZoom = useCalibrationStore((s) => s.displayZoom);
  const updateImage = useImagesStore((s) => s.updateImage);
  const removeImage = useImagesStore((s) => s.removeImage);
  const images = useImagesStore((s) => s.images);
  const moveImageToCell = useImagesStore((s) => s.moveImageToCell);

  const r = Math.floor(imageData.cellIndex / cols);
  const c = imageData.cellIndex % cols;
  const cellX = c * cellWidth + PADDING;
  const cellY = r * cellHeight + PADDING;

  const imgW = imageElement.naturalWidth * displayZoom;
  const imgH = imageElement.naturalHeight * displayZoom;
  const visualW = imgW * imageData.scale;
  const visualH = imgH * imageData.scale;

  const dragBoundFunc = useCallback(
    (pos: { x: number; y: number }) => ({
      x: Math.max(
        -visualW * 0.7,
        Math.min(cellWidth - visualW * 0.3, pos.x),
      ),
      y: Math.max(
        -visualH * 0.7,
        Math.min(cellHeight - visualH * 0.3, pos.y),
      ),
    }),
    [visualW, visualH, cellWidth, cellHeight],
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const nx = Math.round(e.target.x());
      const ny = Math.round(e.target.y());

      const centerX = cellX + nx + visualW / 2;
      const centerY = cellY + ny + visualH / 2;

      const newCol = Math.floor((centerX - PADDING) / cellWidth);
      const newRow = Math.floor((centerY - PADDING) / cellHeight);
      const newIdx = newRow * cols + newCol;

      if (
        newIdx >= 0 &&
        newIdx < rows * cols &&
        newIdx !== imageData.cellIndex
      ) {
        const targetImg = images.find((i) => i.cellIndex === newIdx);
        if (targetImg) {
          updateImage(targetImg.id, { cellIndex: imageData.cellIndex });
        }
        moveImageToCell(imageData.id, newIdx);
      } else {
        updateImage(imageData.id, { offsetX: nx, offsetY: ny });
      }
    },
    [
      imageData,
      cellWidth,
      cellHeight,
      cols,
      rows,
      cellX,
      cellY,
      visualW,
      visualH,
      updateImage,
      moveImageToCell,
      images,
    ],
  );

  const handleTransformEnd = useCallback(() => {
    const node = groupRef.current;
    if (!node) return;
    const newScale = node.scaleX();
    const rot = node.rotation();
    node.scaleX(1);
    node.scaleY(1);
    node.rotation(0);
    updateImage(imageData.id, {
      scale: newScale,
      rotation: Math.round(rot),
    });
  }, [imageData, updateImage]);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Group
        x={cellX}
        y={cellY}
        clipX={0}
        clipY={0}
        clipWidth={cellWidth}
        clipHeight={cellHeight}
      >
        <Group
          ref={groupRef}
          x={imageData.offsetX}
          y={imageData.offsetY}
          draggable
          dragBoundFunc={dragBoundFunc}
          rotation={imageData.rotation}
          scaleX={imageData.scale}
          scaleY={imageData.scale}
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <KonvaImage image={imageElement} width={imgW} height={imgH} />
        </Group>
      </Group>

      {isSelected && (
        <>
          <Transformer ref={trRef} />
          <Rect
            x={cellX + cellWidth - 48}
            y={cellY + 2}
            width={22}
            height={18}
            fill="#ef4444"
            cornerRadius={3}
            onClick={() => removeImage(imageData.id)}
            onTap={() => removeImage(imageData.id)}
          />
          <Text
            x={cellX + cellWidth - 46}
            y={cellY + 4}
            text="x"
            fontSize={10}
            fill="#fff"
            listening={false}
          />
          <Rect
            x={cellX + cellWidth - 24}
            y={cellY + 2}
            width={22}
            height={18}
            fill="#4b5563"
            cornerRadius={3}
            onClick={() =>
              updateImage(imageData.id, {
                offsetX: 0,
                offsetY: 0,
                rotation: 0,
                scale: 1,
              })
            }
            onTap={() =>
              updateImage(imageData.id, {
                offsetX: 0,
                offsetY: 0,
                rotation: 0,
                scale: 1,
              })
            }
          />
          <Text
            x={cellX + cellWidth - 22}
            y={cellY + 4}
            text="0"
            fontSize={10}
            fill="#fff"
            listening={false}
          />
        </>
      )}
    </>
  );
}
