import type { Point, MeasurementData } from "../types";

export type ShapeType = "line" | "circle";

export interface ShapeData {
  id: string;
  type: ShapeType;
  props: Record<string, number | number[] | string>;
}

export interface MeasurementTool {
  id: string;
  name: string;
  onPointerDown(point: Point, imageId?: string | null): void;
  onPointerMove(point: Point): void;
  onPointerUp(point?: Point): MeasurementData | null;
  reset(): void;
  getPreview(): ShapeData[];
}
