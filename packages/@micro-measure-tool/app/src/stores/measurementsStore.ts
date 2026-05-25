import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MeasurementData } from "../types";

interface MeasurementsState {
  measurements: MeasurementData[];
  addMeasurement: (m: MeasurementData) => void;
  removeMeasurement: (id: string) => void;
  setMeasurements: (measurements: MeasurementData[]) => void;
}

export const useMeasurementsStore = create<MeasurementsState>()(
  persist(
    (set) => ({
      measurements: [],
      addMeasurement: (m) =>
        set((s) => ({ measurements: [...s.measurements, m] })),
      removeMeasurement: (id) =>
        set((s) => ({
          measurements: s.measurements.filter((m) => m.id !== id),
        })),
      setMeasurements: (measurements) => set({ measurements }),
    }),
    { name: "mmt-measurements", storage: createJSONStorage(() => sessionStorage) },
  ),
);
