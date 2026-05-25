import { useState } from "react";
import { useCalibrationStore } from "../../stores/calibrationStore";

export default function CalibrationControls() {
  const ratio = useCalibrationStore((s) => s.ratio);
  const calibrating = useCalibrationStore((s) => s.calibrating);
  const setRatio = useCalibrationStore((s) => s.setRatio);
  const startCalibrating = useCalibrationStore((s) => s.startCalibrating);
  const cancelCalibrating = useCalibrationStore((s) => s.cancelCalibrating);
  const [inputVal, setInputVal] = useState(String(ratio));

  function saveRatio() {
    const v = parseFloat(inputVal);
    if (v > 0) setRatio(v);
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
      {!calibrating ? (
        <button
          className="rounded bg-blue-600 px-2 py-0.5 text-xs hover:bg-blue-500 text-gray-100"
          onClick={startCalibrating}
        >
          画线标定
        </button>
      ) : (
        <button
          className="rounded bg-red-600 px-2 py-0.5 text-xs hover:bg-red-500 text-gray-100"
          onClick={cancelCalibrating}
        >
          取消
        </button>
      )}
    </div>
  );
}
