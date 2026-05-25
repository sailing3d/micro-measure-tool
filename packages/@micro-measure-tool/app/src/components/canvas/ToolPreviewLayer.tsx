import { Layer, Line, Circle } from "react-konva";
import { useToolStore } from "../../stores/toolStore";
import { getTool } from "../../tools/registry";
import type { ShapeData } from "../../tools/types";

function renderShape(s: ShapeData) {
  if (s.type === "line") {
    const p = s.props;
    return (
      <Line
        key={s.id}
        points={p.points as number[]}
        stroke={p.stroke as string}
        strokeWidth={p.strokeWidth as number}
        dash={p.dash as number[]}
      />
    );
  }
  if (s.type === "circle") {
    const p = s.props;
    return (
      <Circle
        key={s.id}
        x={p.x as number}
        y={p.y as number}
        radius={p.radius as number}
        stroke={p.stroke as string}
        strokeWidth={p.strokeWidth as number}
      />
    );
  }
  return null;
}

export default function ToolPreviewLayer() {
  const activeToolId = useToolStore((s) => s.activeToolId);

  if (!activeToolId) return null;

  const tool = getTool(activeToolId);
  if (!tool) return null;

  const preview = tool.getPreview();
  if (preview.length === 0) return null;

  return <Layer>{preview.map(renderShape)}</Layer>;
}
