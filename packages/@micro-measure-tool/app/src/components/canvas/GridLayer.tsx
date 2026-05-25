import { Layer, Rect, Text, Group } from "react-konva";
import { useGridStore } from "../../stores/gridStore";

const GRID_COLOR = "#334155";
const GRID_STROKE = 1;
const PADDING = 20;

export default function GridLayer() {
  const rows = useGridStore((s) => s.rows);
  const cols = useGridStore((s) => s.cols);
  const cellWidth = useGridStore((s) => s.cellWidth);
  const cellHeight = useGridStore((s) => s.cellHeight);

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellWidth + PADDING;
      const y = r * cellHeight + PADDING;
      const idx = r * cols + c;
      cells.push(
        <Group key={idx}>
          <Rect
            x={x}
            y={y}
            width={cellWidth}
            height={cellHeight}
            stroke={GRID_COLOR}
            strokeWidth={GRID_STROKE}
          />
          <Text
            x={x + 4}
            y={y + 4}
            text={String(idx + 1)}
            fontSize={11}
            fill="#475569"
          />
        </Group>,
      );
    }
  }

  const totalW = cols * cellWidth + PADDING * 2;
  const totalH = rows * cellHeight + PADDING * 2;

  return (
    <Layer>
      <Rect
        x={0}
        y={0}
        width={totalW}
        height={totalH}
        fill="#0f172a"
      />
      {cells}
    </Layer>
  );
}
