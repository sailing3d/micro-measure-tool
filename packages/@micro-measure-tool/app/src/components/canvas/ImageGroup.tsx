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
  const cellWidth = useGridStore((s) => s.cellWidth);
  const cellHeight = useGridStore((s) => s.cellHeight);
  const cols = useGridStore((s) => s.cols);
  const rows = useGridStore((s) => s.rows);
  const displayZoom = useCalibrationStore((s) => s.displayZoom);
  const updateImage = useImagesStore((s) => s.updateImage);
  const removeImage = useImagesStore((s) => s.removeImage);
  const images = useImagesStore((s) => s.images);
  const moveImageToCell = useImagesStore((s) => s.moveImageToCell);

  const posRef = useRef<Konva.Group>(null);
  const transRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  const r = Math.floor(imageData.cellIndex / cols);
  const c = imageData.cellIndex % cols;
  const cellX = c * cellWidth + PADDING;
  const cellY = r * cellHeight + PADDING;

  const imgW = imageElement.naturalWidth * displayZoom;
  const imgH = imageElement.naturalHeight * displayZoom;
  const visualW = imgW * imageData.scale;
  const visualH = imgH * imageData.scale;

  const handleDragEnd = useCallback(() => {
    const pos = posRef.current;
    if (!pos) return;

    const newRelX = Math.round(pos.x());
    const newRelY = Math.round(pos.y());

    const centerX = cellX + newRelX + visualW / 2;
    const centerY = cellY + newRelY + visualH / 2;

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
        const tR = Math.floor(targetImg.cellIndex / cols);
        const tC = targetImg.cellIndex % cols;
        moveImageToCell(
          targetImg.id,
          imageData.cellIndex,
          targetImg.offsetX - tC * cellWidth + c * cellWidth,
          targetImg.offsetY - tR * cellHeight + r * cellHeight,
        );
      }
      const newCellNX = newCol * cellWidth + PADDING;
      const newCellNY = newRow * cellHeight + PADDING;
      moveImageToCell(
        imageData.id,
        newIdx,
        Math.round(newRelX + cellX - newCellNX),
        Math.round(newRelY + cellY - newCellNY),
      );
    } else {
      updateImage(imageData.id, {
        offsetX: newRelX,
        offsetY: newRelY,
      });
    }
  }, [
    imageData,
    cellWidth,
    cellHeight,
    cols,
    rows,
    cellX,
    cellY,
    r,
    c,
    visualW,
    visualH,
    updateImage,
    moveImageToCell,
    images,
  ]);

  const handleTransformEnd = useCallback(() => {
    const node = transRef.current;
    if (!node) return;

    const finalScale = node.scaleX();
    const finalRot = node.rotation();

    node.scaleX(1);
    node.scaleY(1);
    node.rotation(0);

    const scaleChanged = Math.abs(finalScale - imageData.scale) > 0.0001;

    updateImage(imageData.id, {
      scale: finalScale,
      rotation: scaleChanged
        ? imageData.rotation
        : Math.round(finalRot),
    });
  }, [imageData, updateImage]);

  useEffect(() => {
    if (isSelected && trRef.current && transRef.current) {
      trRef.current.nodes([transRef.current]);
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
          ref={posRef}
          x={imageData.offsetX}
          y={imageData.offsetY}
          draggable
          onDragEnd={handleDragEnd}
        >
          <Group
            ref={transRef}
            x={visualW / 2}
            y={visualH / 2}
            offsetX={visualW / 2}
            offsetY={visualH / 2}
            scaleX={imageData.scale}
            scaleY={imageData.scale}
            rotation={imageData.rotation}
            onClick={onSelect}
            onTap={onSelect}
            onTransformEnd={handleTransformEnd}
          >
            <KonvaImage image={imageElement} width={imgW} height={imgH} />
          </Group>
        </Group>
      </Group>

      {isSelected && (
        <>
          <Transformer
            ref={trRef}
            boundBoxFunc={(_oldBox, newBox) => {
              if (visualW <= 0 || visualH <= 0) return newBox;
              const ratio = visualW / visualH;
              const w = Math.max(20, newBox.width);
              return { ...newBox, width: w, height: w / ratio };
            }}
          />
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
