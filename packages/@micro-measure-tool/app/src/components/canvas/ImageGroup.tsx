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
    const finalScale = node.scaleX();
    node.scaleX(1);
    node.scaleY(1);
    updateImage(imageData.id, { scale: finalScale });
  }, [imageData, updateImage]);

  const rotating = useRef(false);
  const rotateBaseAngle = useRef(0);

  const handleRotateStart = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 2) return;
      e.evt.preventDefault();
      e.evt.stopPropagation();
      const stage = groupRef.current?.getStage();
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      const imgCenterX =
        cellX + imageData.offsetX + visualW / 2;
      const imgCenterY =
        cellY + imageData.offsetY + visualH / 2;
      const mouseAngle =
        (Math.atan2(pos.y - imgCenterY, pos.x - imgCenterX) * 180) / Math.PI;
      rotating.current = true;
      rotateBaseAngle.current = mouseAngle - imageData.rotation;
    },
    [cellX, cellY, imageData, visualW, visualH],
  );

  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;

    function onMove() {
      if (!rotating.current) return;
      const stage = node?.getStage();
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      const imgCenterX =
        cellX + imageData.offsetX + visualW / 2;
      const imgCenterY =
        cellY + imageData.offsetY + visualH / 2;
      const mouseAngle =
        (Math.atan2(pos.y - imgCenterY, pos.x - imgCenterX) * 180) / Math.PI;
      const newRot = Math.round(mouseAngle - rotateBaseAngle.current);
      updateImage(imageData.id, { rotation: newRot });
    }

    function onUp() {
      rotating.current = false;
    }

    const stage = node.getStage();
    if (stage) {
      stage.on("mousemove.rotate", onMove);
      stage.on("mouseup.rotate", onUp);
    }
    return () => {
      if (stage) {
        stage.off("mousemove.rotate", onMove);
        stage.off("mouseup.rotate", onUp);
      }
    };
  }, [imageData, updateImage, cellX, cellY, visualW, visualH]);

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
          rotation={imageData.rotation}
          scaleX={imageData.scale}
          scaleY={imageData.scale}
          onClick={onSelect}
          onTap={onSelect}
          onMouseDown={handleRotateStart}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <KonvaImage image={imageElement} width={imgW} height={imgH} />
        </Group>
      </Group>

      {isSelected && (
        <>
          <Transformer
            ref={trRef}
            rotateEnabled={false}
            boundBoxFunc={(_oldBox, newBox) => {
              const ratio = visualW / visualH;
              if (ratio <= 0) return newBox;
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
