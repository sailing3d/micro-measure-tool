import { create } from "zustand";
import type { MeasurementData } from "../types";

interface MeasurementsState {
  measurements: MeasurementData[];
  addMeasurement: (m: MeasurementData) => void;
  removeMeasurement: (id: string) => void;
  setMeasurements: (measurements: MeasurementData[]) => void;
}

export const useMeasurementsStore = create<MeasurementsState>()((set) => ({
  measurements: [],
  addMeasurement: (m) =>
    set((s) => ({ measurements: [...s.measurements, m] })),
  removeMeasurement: (id) =>
    set((s) => ({
      measurements: s.measurements.filter((m) => m.id !== id),
    })),
  setMeasurements: (measurements) => set({ measurements }),
}));
