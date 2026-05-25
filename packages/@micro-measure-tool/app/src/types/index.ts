export interface Point {
  x: number;
  y: number;
}

export interface ImageData {
  id: string;
  filename: string;
  filepath: string;
  cellIndex: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  scale: number;
}

export type MeasurementType = "h-line" | "constrained-circle";

export interface HLineMeasurement {
  points: [Point, Point];
  lengthPx: number;
  lengthUm: number;
}

export interface ConstrainedCircleMeasurement {
  trajectory: [Point, Point];
  center: Point;
  radiusPx: number;
  diameterUm: number;
}

export interface MeasurementData {
  id: string;
  imageId: string;
  name: string;
  type: MeasurementType;
  data: HLineMeasurement | ConstrainedCircleMeasurement;
}

export interface GridState {
  rows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
  panX: number;
  panY: number;
}

export interface CalibrationState {
  ratio: number;
  displayZoom: number;
}

export interface ProjectMeta {
  name: string;
  path: string;
}
