import { create } from "zustand";

interface CalibrationState {
  ratio: number;
  displayZoom: number;
  setRatio: (ratio: number) => void;
  setDisplayZoom: (displayZoom: number) => void;
}

export const useCalibrationStore = create<CalibrationState>()((set) => ({
  ratio: 1,
  displayZoom: 1,
  setRatio: (ratio) => set({ ratio }),
  setDisplayZoom: (displayZoom) => set({ displayZoom }),
}));
