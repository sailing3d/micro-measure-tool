import { useEffect, useState, useRef } from "react";
import { Layer } from "react-konva";
import { useImagesStore } from "../../stores/imagesStore";
import { useCalibrationStore } from "../../stores/calibrationStore";
import { useGridStore } from "../../stores/gridStore";
import ImageGroup from "./ImageGroup";

export default function ImageLayer() {
  const images = useImagesStore((s) => s.images);
  const imageElementsRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const displayZoom = useCalibrationStore((s) => s.displayZoom);
  const setDisplayZoom = useCalibrationStore((s) => s.setDisplayZoom);
  const { cellWidth, cellHeight } = useGridStore((s) => ({
    cellWidth: s.cellWidth,
    cellHeight: s.cellHeight,
  }));
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
    </Layer>
  );
}
