import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CalibrationState {
  ratio: number;
  displayZoom: number;
  calibrating: boolean;
  setRatio: (ratio: number) => void;
  setDisplayZoom: (displayZoom: number) => void;
  startCalibrating: () => void;
  finishCalibrating: (ratio: number) => void;
  cancelCalibrating: () => void;
}

export const useCalibrationStore = create<CalibrationState>()(
  persist(
    (set) => ({
      ratio: 1,
      displayZoom: 1,
      calibrating: false,
      setRatio: (ratio) => set({ ratio }),
      setDisplayZoom: (displayZoom) => set({ displayZoom }),
      startCalibrating: () => set({ calibrating: true }),
      finishCalibrating: (ratio) => set({ ratio, calibrating: false }),
      cancelCalibrating: () => set({ calibrating: false }),
    }),
    { name: "mmt-calibration", storage: createJSONStorage(() => sessionStorage) },
  ),
);
