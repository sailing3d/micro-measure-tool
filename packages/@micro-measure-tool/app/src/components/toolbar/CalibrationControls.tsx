import { useState, useEffect } from "react";
import { useCalibrationStore } from "../../stores/calibrationStore";
import { useToolStore } from "../../stores/toolStore";

export default function CalibrationControls() {
  const ratio = useCalibrationStore((s) => s.ratio);
  const calibrating = useCalibrationStore((s) => s.calibrating);
  const setRatio = useCalibrationStore((s) => s.setRatio);
  const startCalibrating = useCalibrationStore((s) => s.startCalibrating);
  const cancelCalibrating = useCalibrationStore((s) => s.cancelCalibrating);
  const selectTool = useToolStore((s) => s.selectTool);
  const [inputVal, setInputVal] = useState(String(ratio));

  useEffect(() => {
    setInputVal(String(ratio));
  }, [ratio]);

  function saveRatio() {
    const v = parseFloat(inputVal);
    if (v > 0) setRatio(v);
  }

  function handleStartCalibrating() {
    selectTool(null);
    startCalibrating();
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <span className="text-gray-500">标定</span>
      <label>
        µm/px
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={saveRatio}
          onKeyDown={(e) => e.key === "Enter" && saveRatio()}
          className="ml-1 w-20 rounded bg-gray-800 px-1 py-0.5 text-center text-gray-200 outline-none"
        />
      </label>
      <button
        className={`rounded px-2 py-0.5 text-xs text-gray-100 ${
          calibrating
            ? "bg-amber-600 hover:bg-amber-500"
            : "bg-gray-800 hover:bg-gray-700"
        }`}
        onClick={calibrating ? cancelCalibrating : handleStartCalibrating}
      >
        {calibrating ? "取消" : "画线标定"}
      </button>
    </div>
  );
}
