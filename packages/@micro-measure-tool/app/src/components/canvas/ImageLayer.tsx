import { useRef } from "react";
import { Layer, Line, Circle, Text } from "react-konva";
import { useImagesStore } from "../../stores/imagesStore";
import { useCalibrationStore } from "../../stores/calibrationStore";
import { useGridStore } from "../../stores/gridStore";
import { useMeasurementsStore } from "../../stores/measurementsStore";
import type { MeasurementData } from "../../types";
import ImageGroup from "./ImageGroup";

function measNum(name: string): string {
  const m = name.match(/\d+/);
  return m ? m[0] : "";
}

function renderMeasurement(
  m: MeasurementData,
  isHighlighted: boolean,
  onHover: (id: string | null) => void,
) {
  const color = isHighlighted ? "#06b6d4" : m.type === "h-line" ? "#14b8a6" : "#6366f1";
  const sw = isHighlighted ? 3 : m.type === "h-line" ? 2 : 1.5;
  const num = measNum(m.name);

  if (m.type === "h-line" && "points" in m.data) {
    const [p1, p2] = m.data.points;
    const pp = "paraPoints" in m.data ? (m.data as import("../../types").HLineMeasurement).paraPoints : null;
    const elements = [];
    
    elements.push(
      <Line
        key={m.id}
        points={[p1.x, p1.y, p2.x, p2.y]}
        stroke={color}
        strokeWidth={sw}
        onMouseEnter={() => onHover(m.id)}
        onMouseLeave={() => onHover(null)}
        hitStrokeWidth={10}
        listening={true}
      />,
    );
    
    if (pp) {
      elements.push(
        <Line
          key={`${m.id}-para`}
          points={[pp[0].x, pp[0].y, pp[1].x, pp[1].y]}
          stroke={color}
          strokeWidth={sw}
        />,
      );
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const cmx = (pp[0].x + pp[1].x) / 2;
      const cmy = (pp[0].y + pp[1].y) / 2;
      elements.push(
        <Line
          key={`${m.id}-conn`}
          points={[mx, my, cmx, cmy]}
          stroke={isHighlighted ? "#06b6d4" : "#5eead4"}
          strokeWidth={1.5}
          dash={[4, 2]}
        />,
      );
      elements.push(
        <Circle
          key={`${m.id}-dot`}
          x={(mx + cmx) / 2}
          y={(my + cmy) / 2}
          radius={10}
          stroke={isHighlighted ? "#06b6d4" : "#5eead4"}
          strokeWidth={1}
          listening={false}
        />,
      );
      if (num) {
        elements.push(
          <Text
            key={`${m.id}-num`}
            x={(mx + cmx) / 2 + 6}
            y={(my + cmy) / 2 - 14}
            text={num}
            fontSize={11}
            fill={color}
            listening={false}
          />,
        );
      }
    } else if (num) {
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      elements.push(
        <Text
          key={`${m.id}-num`}
          x={midX + 6}
          y={midY - 14}
          text={num}
          fontSize={11}
          fill={color}
          listening={false}
        />,
      );
    }
    return elements;
  }
  if (m.type === "constrained-circle") {
    const d = m.data;
    const elements = [];
    if ("trajectory" in d) {
      const [t1, t2] = d.trajectory;
      elements.push(
        <Line
          key={`${m.id}-traj`}
          points={[t1.x, t1.y, t2.x, t2.y]}
          stroke={color}
          strokeWidth={0.5}
          dash={[4, 2]}
        />,
      );
    }
    if ("center" in d && "radiusPx" in d) {
      elements.push(
        <Circle
          key={`${m.id}-circle`}
          x={d.center.x}
          y={d.center.y}
          radius={d.radiusPx}
          stroke={color}
          strokeWidth={sw}
          onMouseEnter={() => onHover(m.id)}
          onMouseLeave={() => onHover(null)}
          hitStrokeWidth={10}
          listening={true}
        />,
      );
      if (num) {
        elements.push(
          <Text
            key={`${m.id}-num`}
            x={d.center.x + d.radiusPx + 4}
            y={d.center.y - 6}
            text={num}
            fontSize={11}
            fill={color}
            listening={false}
          />,
        );
      }
    }
    return elements;
  }
  return null;
}

interface Props {
  selectedId: string | null;
  onSelectImage: (id: string | null) => void;
  onDragHoverCellChange: (cellIndex: number | null) => void;
  highlightedMeasurementId: string | null;
  onHoverMeasurement: (id: string | null) => void;
  draggableLocked: boolean;
}

export default function ImageLayer({
  selectedId,
  onSelectImage,
  onDragHoverCellChange,
  highlightedMeasurementId,
  onHoverMeasurement,
  draggableLocked,
}: Props) {
  const images = useImagesStore((s) => s.images);
  const measurements = useMeasurementsStore((s) => s.measurements);
  const displayZoom = useCalibrationStore((s) => s.displayZoom);
  const setDisplayZoom = useCalibrationStore((s) => s.setDisplayZoom);
  const setBaseZoom = useCalibrationStore((s) => s.setBaseZoom);
  const cellWidth = useGridStore((s) => s.cellWidth);
  const cellHeight = useGridStore((s) => s.cellHeight);
  const updateImage = useImagesStore((s) => s.updateImage);

  const imageMapRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const knownIdsRef = useRef(new Set<string>());
  const prevZoom = useRef(displayZoom);

  const currentMap = imageMapRef.current;

  for (const img of images) {
    if (!knownIdsRef.current.has(img.id) && img.filepath) {
      knownIdsRef.current.add(img.id);
      const el = new window.Image();
      el.src = img.filepath;
      currentMap.set(img.id, el);

      if (prevZoom.current === displayZoom) {
        el.onload = () => {
          if (el.naturalWidth > 0 && el.naturalHeight > 0) {
            const zoom = Math.max(
              cellWidth / el.naturalWidth,
              cellHeight / el.naturalHeight,
            );
            if (zoom > 0) {
              setDisplayZoom(zoom);
              setBaseZoom(zoom);
              prevZoom.current = zoom;
              const vw = el.naturalWidth * zoom;
              const vh = el.naturalHeight * zoom;
              updateImage(img.id, {
                offsetX: Math.round((cellWidth - vw) / 2),
                offsetY: Math.round((cellHeight - vh) / 2),
              });
            }
          }
        };
      }
    }
  }

  return (
    <Layer perfectDrawEnabled={false}>
      {images.map((img) => {
        const el = currentMap.get(img.id);
        if (!el) return null;
        return (
          <ImageGroup
            key={img.id}
            imageData={img}
            imageElement={el}
            isSelected={selectedId === img.id}
            onDragHoverCellChange={onDragHoverCellChange}
            draggableLocked={draggableLocked}
            onSelect={() =>
              onSelectImage(selectedId === img.id ? null : img.id)
            }
          />
        );
      })}
      {measurements.map((m) =>
        renderMeasurement(m, highlightedMeasurementId === m.id, onHoverMeasurement),
      )}
    </Layer>
  );
}
