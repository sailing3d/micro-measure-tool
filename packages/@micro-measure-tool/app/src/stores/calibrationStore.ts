import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CalibrationState {
  ratio: number;
  displayZoom: number;
  baseZoom: number;
  calibrating: boolean;
  setRatio: (ratio: number) => void;
  setDisplayZoom: (displayZoom: number) => void;
  setBaseZoom: (baseZoom: number) => void;
  startCalibrating: () => void;
  finishCalibrating: (ratio: number) => void;
  cancelCalibrating: () => void;
}

export const useCalibrationStore = create<CalibrationState>()(
  persist(
    (set) => ({
      ratio: 1,
      displayZoom: 1,
      baseZoom: 1,
      calibrating: false,
      setRatio: (ratio) => set({ ratio }),
      setDisplayZoom: (displayZoom) => set({ displayZoom }),
      setBaseZoom: (baseZoom) => set({ baseZoom }),
      startCalibrating: () => set({ calibrating: true }),
      finishCalibrating: (ratio) => set({ ratio, calibrating: false }),
      cancelCalibrating: () => set({ calibrating: false }),
    }),
    { name: "mmt-calibration", storage: createJSONStorage(() => sessionStorage) },
  ),
);
