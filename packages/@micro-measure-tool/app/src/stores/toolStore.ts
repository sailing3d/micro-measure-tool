import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ToolState {
  activeToolId: string | null;
  selectTool: (id: string | null) => void;
}

export const useToolStore = create<ToolState>()(
  persist(
    (set) => ({
      activeToolId: null,
      selectTool: (activeToolId) => set({ activeToolId }),
    }),
    { name: "mmt-tool", storage: createJSONStorage(() => sessionStorage) },
  ),
);
