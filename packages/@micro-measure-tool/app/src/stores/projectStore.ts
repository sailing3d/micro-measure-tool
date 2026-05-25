import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ProjectState {
  name: string;
  isOpen: boolean;
  openProject: (name: string) => void;
  closeProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      name: "",
      isOpen: false,
      openProject: (name) => set({ name, isOpen: true }),
      closeProject: () => set({ name: "", isOpen: false }),
    }),
    { name: "mmt-project", storage: createJSONStorage(() => sessionStorage) },
  ),
);
