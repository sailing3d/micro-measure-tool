import { Layer, Text } from "react-konva";
import { useGridStore } from "../../stores/gridStore";
import { useImagesStore } from "../../stores/imagesStore";

const PADDING = 20;

export default function GridLabelsLayer() {
  const cols = useGridStore((s) => s.cols);
  const cellWidth = useGridStore((s) => s.cellWidth);
  const cellHeight = useGridStore((s) => s.cellHeight);
  const images = useImagesStore((s) => s.images);

  return (
    <Layer listening={false}>
      {images.map((img) => {
        const r = Math.floor(img.cellIndex / cols);
        const c = img.cellIndex % cols;
        const x = c * cellWidth + PADDING;
        const y = r * cellHeight + PADDING;
        return (
          <Text
            key={img.id}
            x={x + 4}
            y={y + cellHeight - 16}
            text={img.filename}
            fontSize={10}
            fill="#e2e8f0"
            stroke="#000000"
            strokeWidth={0.5}
            shadowColor="#0f172a"
            shadowBlur={2}
            shadowOffsetX={1}
            shadowOffsetY={1}
          />
        );
      })}
    </Layer>
  );
}
