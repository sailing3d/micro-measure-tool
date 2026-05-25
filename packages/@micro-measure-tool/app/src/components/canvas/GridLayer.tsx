import { Layer, Rect, Text, Group } from "react-konva";
import { useGridStore } from "../../stores/gridStore";

const GRID_COLOR = "#334155";
const HIGHLIGHT_COLOR = "#1e40af";
const GRID_STROKE = 1;
const PADDING = 20;

interface Props {
  selectedCellIndex: number | null;
  dragTargetCellIndex?: number | null;
}

export default function GridLayer({ selectedCellIndex, dragTargetCellIndex = null }: Props) {
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
      const isDragTarget = dragTargetCellIndex === idx;
      const isSelected = selectedCellIndex === idx;
      const isHighlighted = isDragTarget || isSelected;

      cells.push(
        <Group key={idx}>
          {isHighlighted && (
            <Rect
              x={x}
              y={y}
              width={cellWidth}
              height={cellHeight}
              fill={isDragTarget ? "#1d4ed8" : "#1e3a5f"}
              opacity={isDragTarget ? 0.38 : 0.5}
            />
          )}
          <Rect
            x={x}
            y={y}
            width={cellWidth}
            height={cellHeight}
            stroke={isDragTarget ? "#60a5fa" : isHighlighted ? HIGHLIGHT_COLOR : GRID_COLOR}
            strokeWidth={isDragTarget ? 3 : isHighlighted ? 2 : GRID_STROKE}
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
      <Rect x={0} y={0} width={totalW} height={totalH} fill="#0f172a" />
      {cells}
    </Layer>
  );
}
