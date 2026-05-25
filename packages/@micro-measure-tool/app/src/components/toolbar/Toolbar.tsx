import GridControls from "./GridControls";
import CalibrationControls from "./CalibrationControls";

export default function Toolbar() {
  return (
    <div className="flex items-center gap-4 border-b border-gray-800 bg-gray-900 px-4 py-2">
      <span className="text-sm font-semibold text-gray-300">Micro Measure</span>
      <div className="h-5 w-px bg-gray-700" />
      <GridControls />
      <div className="h-5 w-px bg-gray-700" />
      <CalibrationControls />
    </div>
  );
}
