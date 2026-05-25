import { create } from "zustand";

interface ToolState {
  activeToolId: string | null;
  isMeasuring: boolean;
  selectTool: (id: string | null) => void;
  startMeasuring: () => void;
  finishMeasuring: () => void;
}

export const useToolStore = create<ToolState>()((set) => ({
  activeToolId: null,
  isMeasuring: false,
  selectTool: (activeToolId) => set({ activeToolId, isMeasuring: false }),
  startMeasuring: () => set({ isMeasuring: true }),
  finishMeasuring: () => set({ isMeasuring: false }),
}));
