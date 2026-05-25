import { create } from "zustand";
import type { GridState } from "../types";

interface GridActions {
  setRows: (rows: number) => void;
  setCols: (cols: number) => void;
  setCellWidth: (cellWidth: number) => void;
  setCellHeight: (cellHeight: number) => void;
  setPan: (x: number, y: number) => void;
}

const DEFAULT: GridState = {
  rows: 3,
  cols: 3,
  cellWidth: 600,
  cellHeight: 400,
  panX: 0,
  panY: 0,
};

export const useGridStore = create<GridState & GridActions>()((set) => ({
  ...DEFAULT,
  setRows: (rows) => set({ rows }),
  setCols: (cols) => set({ cols }),
  setCellWidth: (cellWidth) => set({ cellWidth }),
  setCellHeight: (cellHeight) => set({ cellHeight }),
  setPan: (x, y) => set({ panX: x, panY: y }),
}));
