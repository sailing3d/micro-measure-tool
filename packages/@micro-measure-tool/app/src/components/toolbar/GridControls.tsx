import { useGridStore } from "../../stores/gridStore";

export default function GridControls() {
  const rows = useGridStore((s) => s.rows);
  const cols = useGridStore((s) => s.cols);
  const cellWidth = useGridStore((s) => s.cellWidth);
  const cellHeight = useGridStore((s) => s.cellHeight);
  const setRows = useGridStore((s) => s.setRows);
  const setCols = useGridStore((s) => s.setCols);
  const setCellWidth = useGridStore((s) => s.setCellWidth);
  const setCellHeight = useGridStore((s) => s.setCellHeight);

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <label>
        Rows
        <input
          type="number"
          min={1}
          max={20}
          value={rows}
          onChange={(e) => setRows(Number(e.target.value))}
          className="ml-1 w-12 rounded bg-gray-800 px-1 py-0.5 text-center text-gray-200 outline-none"
        />
      </label>
      <label>
        Cols
        <input
          type="number"
          min={1}
          max={20}
          value={cols}
          onChange={(e) => setCols(Number(e.target.value))}
          className="ml-1 w-12 rounded bg-gray-800 px-1 py-0.5 text-center text-gray-200 outline-none"
        />
      </label>
      <label>
        W
        <input
          type="number"
          min={100}
          max={4000}
          step={50}
          value={cellWidth}
          onChange={(e) => setCellWidth(Number(e.target.value))}
          className="ml-1 w-16 rounded bg-gray-800 px-1 py-0.5 text-center text-gray-200 outline-none"
        />
      </label>
      <label>
        H
        <input
          type="number"
          min={100}
          max={4000}
          step={50}
          value={cellHeight}
          onChange={(e) => setCellHeight(Number(e.target.value))}
          className="ml-1 w-16 rounded bg-gray-800 px-1 py-0.5 text-center text-gray-200 outline-none"
        />
      </label>
    </div>
  );
}
