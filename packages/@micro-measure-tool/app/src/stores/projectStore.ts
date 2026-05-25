import { create } from "zustand";

interface ProjectState {
  name: string;
  isOpen: boolean;
  openProject: (name: string) => void;
  closeProject: () => void;
}

export const useProjectStore = create<ProjectState>()((set) => ({
  name: "",
  isOpen: false,
  openProject: (name) => set({ name, isOpen: true }),
  closeProject: () => set({ name: "", isOpen: false }),
}));
