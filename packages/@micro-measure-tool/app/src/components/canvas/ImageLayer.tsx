import { useEffect, useState, useRef } from "react";
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

export default function ImageLayer() {
  const images = useImagesStore((s) => s.images);
  const measurements = useMeasurementsStore((s) => s.measurements);
  const imageElementsRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const displayZoom = useCalibrationStore((s) => s.displayZoom);
  const setDisplayZoom = useCalibrationStore((s) => s.setDisplayZoom);
  const cellWidth = useGridStore((s) => s.cellWidth);
  const cellHeight = useGridStore((s) => s.cellHeight);
  const prevZoom = useRef(displayZoom);
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const map = imageElementsRef.current;
    let changed = false;

    images.forEach((img) => {
      if (!map.has(img.id) && img.filepath) {
        changed = true;
        const el = new window.Image();
        el.src = img.filepath;
        map.set(img.id, el);

        if (images.indexOf(img) === 0 && displayZoom === prevZoom.current) {
          el.onload = () => {
            const zoom = Math.min(
              cellWidth / el.naturalWidth,
              cellHeight / el.naturalHeight,
            );
            setDisplayZoom(zoom);
            prevZoom.current = zoom;
          };
        }
      }
    });

    if (changed) forceRender((n) => n + 1);
  }, [images, cellWidth, cellHeight, displayZoom, setDisplayZoom]);

  return (
    <Layer>
      {images.map((img) => {
        const el = imageElementsRef.current.get(img.id);
        if (!el) return null;
        return (
          <ImageGroup
            key={img.id}
            imageData={img}
            imageElement={el}
            isSelected={selectedId === img.id}
            onSelect={() =>
              setSelectedId((prev) => (prev === img.id ? null : img.id))
            }
          />
        );
      })}
      {measurements.map(renderMeasurement)}
    </Layer>
  );
}
