import type { Point, MeasurementData } from "../types";
import type { MeasurementTool, ShapeData } from "./types";

export class HLineTool implements MeasurementTool {
  id = "h-line";
  name = "长度测量";

  private point1: Point | null = null;
  private point2: Point | null = null;
  private pointer: Point | null = null;

  onPointerDown(point: Point): void {
    if (!this.point1) {
      this.point1 = point;
      this.pointer = point;
    } else {
      this.point2 = point;
    }
  }

  onPointerMove(point: Point): void {
    this.pointer = point;
  }

  onPointerUp(): MeasurementData | null {
    if (!this.point1 || !this.point2) return null;

    const dx = this.point2.x - this.point1.x;
    const dy = this.point2.y - this.point1.y;
    const lengthPx = Math.sqrt(dx * dx + dy * dy);

    if (lengthPx < 5) return null;

    const data: MeasurementData = {
      id: `meas-${Date.now()}`,
      imageId: "",
      name: "",
      type: "h-line",
      data: {
        points: [this.point1, this.point2],
        lengthPx,
        lengthUm: 0,
      },
    };

    this.reset();
    return data;
  }

  getPreview(): ShapeData[] {
    const shapes: ShapeData[] = [];
    if (this.point1) {
      shapes.push({
        id: "point1",
        type: "circle",
        props: { x: this.point1.x, y: this.point1.y, radius: 4, fill: "#14b8a6" },
      });
    }
    if (this.point2) {
      shapes.push({
        id: "point2",
        type: "circle",
        props: { x: this.point2.x, y: this.point2.y, radius: 4, fill: "#f59e0b" },
      });
    }
    const end = this.point2 || this.pointer;
    if (this.point1 && end) {
      shapes.push({
        id: "line",
        type: "line",
        props: {
          points: [this.point1.x, this.point1.y, end.x, end.y],
          stroke: this.point2 ? "#14b8a6" : "#99f6e4",
          strokeWidth: 2,
          ...(this.point2 ? {} : { dash: [6, 3] }),
        },
      });
    }
    return shapes;
  }

  reset(): void {
    this.point1 = null;
    this.point2 = null;
    this.pointer = null;
  }
}
