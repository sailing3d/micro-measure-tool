import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ToolState {
  activeToolId: string | null;
  isMeasuring: boolean;
  selectTool: (id: string | null) => void;
  startMeasuring: () => void;
  finishMeasuring: () => void;
}

export const useToolStore = create<ToolState>()(
  persist(
    (set) => ({
      activeToolId: null,
      isMeasuring: false,
      selectTool: (activeToolId) => set({ activeToolId, isMeasuring: false }),
      startMeasuring: () => set({ isMeasuring: true }),
      finishMeasuring: () => set({ isMeasuring: false }),
    }),
    { name: "mmt-tool", storage: createJSONStorage(() => sessionStorage) },
  ),
);
