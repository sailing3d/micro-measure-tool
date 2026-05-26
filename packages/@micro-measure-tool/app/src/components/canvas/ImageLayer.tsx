import { useRef } from "react";
import { Layer, Line, Circle } from "react-konva";
import { useImagesStore } from "../../stores/imagesStore";
import { useCalibrationStore } from "../../stores/calibrationStore";
import { useGridStore } from "../../stores/gridStore";
import { useMeasurementsStore } from "../../stores/measurementsStore";
import type { MeasurementData } from "../../types";
import ImageGroup from "./ImageGroup";

function renderMeasurement(m: MeasurementData) {
  if (m.type === "h-line" && "points" in m.data) {
    const [p1, p2] = m.data.points;
    return (
      <Line
        key={m.id}
        points={[p1.x, p1.y, p2.x, p2.y]}
        stroke="#f59e0b"
        strokeWidth={2}
      />
    );
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
          stroke="#3b82f6"
          strokeWidth={1}
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
          stroke="#3b82f6"
          strokeWidth={1.5}
        />,
      );
    }
    return elements;
  }
  return null;
}

interface Props {
  selectedId: string | null;
  onSelectImage: (id: string | null) => void;
  onHoverImage: (id: string | null) => void;
  onDragHoverCellChange: (cellIndex: number | null) => void;
  draggableLocked: boolean;
}

export default function ImageLayer({ selectedId, onSelectImage, onHoverImage, onDragHoverCellChange, draggableLocked }: Props) {
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
    <Layer>
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
            onHover={(hovered) => onHoverImage(hovered ? img.id : null)}
            draggableLocked={draggableLocked}
            onSelect={() =>
              onSelectImage(selectedId === img.id ? null : img.id)
            }
          />
        );
      })}
      {measurements.map(renderMeasurement)}
    </Layer>
  );
}
