import { create } from "zustand";
import type { ImageData } from "../types";

interface ImagesState {
  images: ImageData[];
  addImage: (img: ImageData) => void;
  removeImage: (id: string) => void;
  updateImage: (id: string, patch: Partial<ImageData>) => void;
  moveImageToCell: (id: string, cellIndex: number) => void;
  setImages: (images: ImageData[]) => void;
}

export const useImagesStore = create<ImagesState>()((set) => ({
  images: [],
  addImage: (img) => set((s) => ({ images: [...s.images, img] })),
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
  moveImageToCell: (id, cellIndex) =>
    set((s) => ({
      images: s.images.map((i) =>
        i.id === id ? { ...i, cellIndex, offsetX: 0, offsetY: 0 } : i,
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
}));
