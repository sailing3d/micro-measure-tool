import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GridState } from "../types";

interface GridActions {
  setRows: (rows: number) => void;
  setCols: (cols: number) => void;
  setCellWidth: (cellWidth: number) => void;
  setCellHeight: (cellHeight: number) => void;
  setPan: (x: number, y: number) => void;
  setCanvasScale: (scale: number) => void;
}

const DEFAULT: GridState = {
  rows: 3,
  cols: 3,
  cellWidth: 600,
  cellHeight: 400,
  panX: 0,
  panY: 0,
  canvasScale: 1,
};

export const useGridStore = create<GridState & GridActions>()(
  persist(
    (set) => ({
      ...DEFAULT,
      setRows: (rows) => set({ rows }),
      setCols: (cols) => set({ cols }),
      setCellWidth: (cellWidth) => set({ cellWidth }),
      setCellHeight: (cellHeight) => set({ cellHeight }),
      setPan: (x, y) => set({ panX: x, panY: y }),
      setCanvasScale: (canvasScale) => set({ canvasScale }),
    }),
    { name: "mmt-grid", storage: createJSONStorage(() => sessionStorage) },
  ),
);
