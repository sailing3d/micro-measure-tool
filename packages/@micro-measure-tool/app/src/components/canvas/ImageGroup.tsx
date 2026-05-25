import { useRef, useCallback, useEffect } from "react";
import { Group, Image as KonvaImage, Transformer } from "react-konva";
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
  const images = useImagesStore((s) => s.images);
  const moveImageToCell = useImagesStore((s) => s.moveImageToCell);

  const r = Math.floor(imageData.cellIndex / cols);
  const c = imageData.cellIndex % cols;
  const cellX = c * cellWidth + PADDING;
  const cellY = r * cellHeight + PADDING;

  const imgW = imageElement.naturalWidth * displayZoom * imageData.scale;
  const imgH = imageElement.naturalHeight * displayZoom * imageData.scale;

  const x = cellX + imageData.offsetX;
  const y = cellY + imageData.offsetY;

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const nx = e.target.x() - cellX;
      const ny = e.target.y() - cellY;

      const centerX = e.target.x() + imgW / 2;
      const centerY = e.target.y() + imgH / 2;

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
        updateImage(imageData.id, { offsetX: Math.round(nx), offsetY: Math.round(ny) });
      }
    },
    [imageData, cellWidth, cellHeight, cols, rows, cellX, cellY, imgW, imgH, updateImage, moveImageToCell, images],
  );

  const handleTransformEnd = useCallback(() => {
    const node = groupRef.current;
    if (!node) return;
    const scale = node.scaleX();
    const rot = node.rotation();
    node.scaleX(1);
    node.scaleY(1);
    updateImage(imageData.id, {
      scale: imageData.scale * scale,
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
        ref={groupRef}
        x={x}
        y={y}
        draggable
        rotation={imageData.rotation}
        scaleX={imageData.scale}
        scaleY={imageData.scale}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <KonvaImage
          image={imageElement}
          width={imageElement.naturalWidth * displayZoom}
          height={imageElement.naturalHeight * displayZoom}
        />
      </Group>
      {isSelected && (
        <Transformer ref={trRef} />
      )}
    </>
  );
}
