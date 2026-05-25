import type { Point, MeasurementData } from "../types";
import type { MeasurementTool, ShapeData } from "./types";

export class HLineTool implements MeasurementTool {
  id = "h-line";
  name = "长度测量";

  private start: Point | null = null;
  private current: Point | null = null;

  onPointerDown(point: Point): void {
    this.start = point;
    this.current = point;
  }

  onPointerMove(point: Point): void {
    this.current = point;
  }

  onPointerUp(): MeasurementData | null {
    if (!this.start || !this.current) return null;

    const dx = this.current.x - this.start.x;
    const dy = this.current.y - this.start.y;
    const lengthPx = Math.sqrt(dx * dx + dy * dy);

    if (lengthPx < 5) {
      this.reset();
      return null;
    }

    const data: MeasurementData = {
      id: `meas-${Date.now()}`,
      imageId: "",
      name: "",
      type: "h-line",
      data: {
        points: [this.start, this.current],
        lengthPx,
        lengthUm: 0,
      },
    };

    this.reset();
    return data;
  }

  getPreview(): ShapeData[] {
    if (!this.start || !this.current) return [];
    return [
      {
        id: "h-line-main",
        type: "line",
        props: {
          points: [this.start.x, this.start.y, this.current.x, this.current.y],
          stroke: "#f59e0b",
          strokeWidth: 2,
        },
      },
    ];
  }

  reset(): void {
    this.start = null;
    this.current = null;
  }
}
