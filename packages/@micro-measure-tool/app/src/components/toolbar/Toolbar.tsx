import ProjectControls from "./ProjectControls";
import GridControls from "./GridControls";
import CalibrationControls from "./CalibrationControls";
import ToolSelector from "./ToolSelector";

interface Props {
  onHelp: () => void;
}

export default function Toolbar({ onHelp }: Props) {
  return (
    <div className="flex items-center gap-4 border-b border-gray-800 bg-gray-900 px-4 py-2">
      <ProjectControls />
      <div className="h-5 w-px bg-gray-700" />
      <GridControls />
      <div className="h-5 w-px bg-gray-700" />
      <CalibrationControls />
      <div className="h-5 w-px bg-gray-700" />
      <ToolSelector />
      <div className="flex-1" />
      <button
        className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400 hover:bg-gray-700"
        onClick={onHelp}
        title="帮助"
      >
        ?
      </button>
    </div>
  );
}
