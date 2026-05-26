import { useToolStore } from "../../stores/toolStore";
import { useCalibrationStore } from "../../stores/calibrationStore";
import { getTools, getTool } from "../../tools/registry";

export default function ToolSelector() {
  const activeToolId = useToolStore((s) => s.activeToolId);
  const selectTool = useToolStore((s) => s.selectTool);
  const cancelCalibrating = useCalibrationStore((s) => s.cancelCalibrating);
  const tools = getTools();

  function handleSelect(id: string) {
    cancelCalibrating();
    if (activeToolId === id) {
      getTool(id)?.reset();
      selectTool(null);
    } else {
      selectTool(id);
    }
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`rounded px-2 py-0.5 ${
            activeToolId === tool.id
              ? "bg-blue-600 text-gray-100"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
          onClick={() => handleSelect(tool.id)}
        >
          {tool.name}
        </button>
      ))}
    </div>
  );
}
