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
import { rotatingRef } from "./rotationState";
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
  const scaleRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  const r = Math.floor(imageData.cellIndex / cols);
  const c = imageData.cellIndex % cols;
  const cellX = c * cellWidth + PADDING;
  const cellY = r * cellHeight + PADDING;

  const imgW = imageElement.naturalWidth * displayZoom;
  const imgH = imageElement.naturalHeight * displayZoom;
  const visW = imgW * imageData.scale;
  const visH = imgH * imageData.scale;

  const handleDragEnd = useCallback(() => {
    const pos = posRef.current;
    if (!pos) return;
    const nx = Math.round(pos.x());
    const ny = Math.round(pos.y());
    const cx = cellX + nx + imgW / 2;
    const cy = cellY + ny + imgH / 2;
    const nc = Math.floor((cx - PADDING) / cellWidth);
    const nr = Math.floor((cy - PADDING) / cellHeight);
    const ni = nr * cols + nc;

    if (ni >= 0 && ni < rows * cols && ni !== imageData.cellIndex) {
      const tgt = images.find((i) => i.cellIndex === ni);
      if (tgt) {
        const tr = Math.floor(tgt.cellIndex / cols);
        const tc = tgt.cellIndex % cols;
        moveImageToCell(tgt.id, imageData.cellIndex,
          tgt.offsetX - tc * cellWidth + c * cellWidth,
          tgt.offsetY - tr * cellHeight + r * cellHeight);
      }
      const ncx = nc * cellWidth + PADDING;
      const ncy = nr * cellHeight + PADDING;
      moveImageToCell(imageData.id, ni,
        Math.round(nx + cellX - ncx),
        Math.round(ny + cellY - ncy));
    } else {
      updateImage(imageData.id, { offsetX: nx, offsetY: ny });
    }
  }, [imageData, cellWidth, cellHeight, cols, rows, cellX, cellY, r, c, imgW, imgH, updateImage, moveImageToCell, images]);

  const handleScaleEnd = useCallback(() => {
    const node = scaleRef.current;
    if (!node) return;
    const s = node.scaleX();
    updateImage(imageData.id, { scale: s });
  }, [imageData, updateImage]);

  const rotating = useRef(false);
  const baseAngle = useRef(0);

  useEffect(() => {
    const node = posRef.current;
    if (!node) return;

    function onDown(e: Konva.KonvaEventObject<MouseEvent>) {
      if (e.evt.button !== 2) return;
      e.evt.preventDefault();
      const stage = node?.getStage();
      if (!stage) return;
      const p = stage.getPointerPosition();
      if (!p) return;
      const cx = cellX + imageData.offsetX + imgW / 2;
      const cy = cellY + imageData.offsetY + imgH / 2;
      const ma = Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI;
      rotatingRef.current = true;
      rotating.current = true;
      baseAngle.current = ma - imageData.rotation;
    }

    function onMove() {
      if (!rotating.current) return;
      const stage = node?.getStage();
      if (!stage) return;
      const p = stage.getPointerPosition();
      if (!p) return;
      const cx = cellX + imageData.offsetX + imgW / 2;
      const cy = cellY + imageData.offsetY + imgH / 2;
      const ma = Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI;
      updateImage(imageData.id, { rotation: Math.round(ma - baseAngle.current) });
    }

    function onUp() { rotating.current = false; rotatingRef.current = false; }

    node.on("mousedown.rotimg", onDown);
    const stage = node.getStage();
    if (stage) {
      stage.on("mousemove.rotimg", onMove);
      stage.on("mouseup.rotimg", onUp);
    }
    return () => {
      node.off("mousedown.rotimg");
      if (stage) {
        stage.off("mousemove.rotimg", onMove);
        stage.off("mouseup.rotimg", onUp);
      }
    };
  }, [imageData, updateImage, cellX, cellY, imgW, imgH]);

  useEffect(() => {
    if (isSelected && trRef.current && scaleRef.current) {
      trRef.current.nodes([scaleRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Group x={cellX} y={cellY}
        clipX={0} clipY={0} clipWidth={cellWidth} clipHeight={cellHeight}>
        <Group ref={posRef}
          x={imageData.offsetX} y={imageData.offsetY}
          draggable onDragEnd={handleDragEnd}>
          <Group ref={scaleRef}
            x={imgW / 2} y={imgH / 2}
            offsetX={imgW / 2} offsetY={imgH / 2}
            rotation={imageData.rotation}
            scaleX={imageData.scale} scaleY={imageData.scale}
            onClick={onSelect} onTap={onSelect}
            onTransformEnd={handleScaleEnd}>
            <KonvaImage image={imageElement} width={imgW} height={imgH} />
          </Group>
        </Group>
      </Group>

      {isSelected && (
        <>
          <Transformer ref={trRef} rotateEnabled={false}
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
            onClick={() =>
              updateImage(imageData.id, {
                offsetX: Math.round((cellWidth - imgW) / 2),
                offsetY: Math.round((cellHeight - imgH) / 2),
                rotation: 0,
                scale: 1,
              })
            }
            onTap={() =>
              updateImage(imageData.id, {
                offsetX: Math.round((cellWidth - imgW) / 2),
                offsetY: Math.round((cellHeight - imgH) / 2),
                rotation: 0,
                scale: 1,
              })
            } />
          <Text x={cellX + cellWidth - 22} y={cellY + 4}
            text="0" fontSize={10} fill="#fff" listening={false} />
        </>
      )}
    </>
  );
}
