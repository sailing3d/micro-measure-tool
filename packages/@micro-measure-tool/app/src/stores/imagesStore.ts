import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ImageData } from "../types";

interface ImagesState {
  images: ImageData[];
  addImage: (img: ImageData) => void;
  removeImage: (id: string) => void;
  updateImage: (id: string, patch: Partial<ImageData>) => void;
  moveImageToCell: (id: string, cellIndex: number, relX?: number, relY?: number) => void;
  setImages: (images: ImageData[]) => void;
}

export const useImagesStore = create<ImagesState>()(
  persist(
    (set) => ({
      images: [],
      addImage: (img) =>
        set((s) => {
          const maxLabel = s.images.reduce((m, i) => Math.max(m, i.label || 0), 0);
          return { images: [...s.images, { ...img, label: maxLabel + 1 }] };
        }),
      removeImage: (id) =>
        set((s) => {
          const img = s.images.find((i) => i.id === id);
          if (img?.filepath.startsWith("blob:")) {
            URL.revokeObjectURL(img.filepath);
          }
          return { images: s.images.filter((i) => i.id !== id) };
        }),
      updateImage: (id, patch) =>
        set((s) => ({
          images: s.images.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
      moveImageToCell: (id, cellIndex, relX = 0, relY = 0) =>
        set((s) => ({
          images: s.images.map((i) =>
            i.id === id ? { ...i, cellIndex, offsetX: relX, offsetY: relY } : i,
          ),
        })),
      setImages: (images) =>
        set((s) => {
          for (const img of s.images) {
            if (img.filepath.startsWith("blob:")) {
              URL.revokeObjectURL(img.filepath);
            }
          }
          return { images };
        }),
    }),
    { name: "mmt-images", storage: createJSONStorage(() => sessionStorage) },
  ),
);
