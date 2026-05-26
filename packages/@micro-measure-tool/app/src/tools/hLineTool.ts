import type { Point, MeasurementData } from "../types";
import type { MeasurementTool, ShapeData } from "./types";

type Phase = "idle" | "base" | "adjust";

export class HLineTool implements MeasurementTool {
  id = "h-line";
  name = "距离测量";

  private phase: Phase = "idle";
  private bp1: Point | null = null;
  private bp2: Point | null = null;
  private pointer: Point | null = null;
  private offset = 0;

  onPointerDown(point: Point): void {
    if (this.phase === "idle") {
      this.bp1 = point;
      this.pointer = point;
      this.phase = "base";
    } else if (this.phase === "base") {
      this.bp2 = point;
      this.phase = "adjust";
    } else if (this.phase === "adjust") {
      // confirm — measurement will be created in onPointerUp
    }
  }

  onPointerMove(point: Point): void {
    if (this.phase === "base") {
      this.pointer = point;
    } else if (this.phase === "adjust" && this.bp1 && this.bp2) {
      this.pointer = point;
      const mx = (this.bp1.x + this.bp2.x) / 2;
      const my = (this.bp1.y + this.bp2.y) / 2;
      const bdx = this.bp2.x - this.bp1.x;
      const bdy = this.bp2.y - this.bp1.y;
      const bLen = Math.sqrt(bdx * bdx + bdy * bdy);
      if (bLen === 0) return;

      const bx = bdx / bLen;
      const by = bdy / bLen;
      const px = -by;
      const py = bx;
      const dx = point.x - mx;
      const dy = point.y - my;
      this.offset = dx * px + dy * py;
    }
  }

  onPointerUp(): MeasurementData | null {
    if (this.phase === "base" && this.bp1 && this.bp2) {
      this.phase = "adjust";
      return null;
    }
    if (this.phase === "adjust" && this.bp1 && this.bp2 && Math.abs(this.offset) > 2) {
      const bdx = this.bp2.x - this.bp1.x;
      const bdy = this.bp2.y - this.bp1.y;
      const bLen = Math.sqrt(bdx * bdx + bdy * bdy);
      const bx = bdx / bLen;
      const by = bdy / bLen;
      const px = -by;
      const py = bx;

      const p1: Point = {
        x: this.bp1.x + px * this.offset,
        y: this.bp1.y + py * this.offset,
      };
      const p2: Point = {
        x: this.bp2.x + px * this.offset,
        y: this.bp2.y + py * this.offset,
      };

      const data: MeasurementData = {
        id: `meas-${Date.now()}`,
        imageId: "",
        name: "",
        type: "h-line",
        data: {
          points: [this.bp1, this.bp2],
          paraPoints: [p1, p2],
          lengthPx: Math.abs(this.offset),
          lengthUm: 0,
        },
      };

      this.reset();
      return data;
    }
    return null;
  }

  getPreview(): ShapeData[] {
    const shapes: ShapeData[] = [];

    if (this.bp1) {
      shapes.push({
        id: "bp1",
        type: "circle",
        props: { x: this.bp1.x, y: this.bp1.y, radius: 4, fill: "#14b8a6" },
      });
      shapes.push({
        id: "bp2",
        type: "circle",
        props: { x: this.bp2?.x ?? this.pointer!.x, y: this.bp2?.y ?? this.pointer!.y, radius: 4, fill: this.bp2 ? "#14b8a6" : "#99f6e4" },
      });

      const end = this.bp2 || this.pointer!;
      shapes.push({
        id: "base-line",
        type: "line",
        props: {
          points: [this.bp1.x, this.bp1.y, end.x, end.y],
          stroke: this.bp2 ? "#14b8a6" : "#99f6e4",
          strokeWidth: 2,
          ...(this.bp2 ? {} : { dash: [6, 3] }),
        },
      });
    }

    if (this.phase === "adjust" && this.bp1 && this.bp2) {
      const mx = (this.bp1.x + this.bp2.x) / 2;
      const my = (this.bp1.y + this.bp2.y) / 2;
      const bdx = this.bp2.x - this.bp1.x;
      const bdy = this.bp2.y - this.bp1.y;
      const bLen = Math.sqrt(bdx * bdx + bdy * bdy);
      if (bLen > 0) {
        const bx = bdx / bLen;
        const by = bdy / bLen;
        const px = -by;
        const py = bx;

        const p1x = this.bp1.x + px * this.offset;
        const p1y = this.bp1.y + py * this.offset;
        const p2x = this.bp2.x + px * this.offset;
        const p2y = this.bp2.y + py * this.offset;

        shapes.push({
          id: "parallel-line",
          type: "line",
          props: {
            points: [p1x, p1y, p2x, p2y],
            stroke: "#14b8a6",
            strokeWidth: 2,
          },
        });

        const cmx = mx + px * this.offset;
        const cmy = my + py * this.offset;

        shapes.push({
          id: "connector",
          type: "line",
          props: {
            points: [mx, my, cmx, cmy],
            stroke: "#06b6d4",
            strokeWidth: 1.5,
            dash: [4, 2],
          },
        });

        shapes.push({
          id: "distance-label",
          type: "text",
          props: {
            x: (mx + cmx) / 2 + 10,
            y: (my + cmy) / 2 - 12,
            text: `${Math.abs(this.offset).toFixed(1)}`,
            fontSize: 14,
            fontFamily: "Arial",
            fill: "#06b6d4",
            stroke: "#ffffff",
            strokeWidth: 0.5,
          },
        });
      }
    }

    return shapes;
  }

  reset(): void {
    this.phase = "idle";
    this.bp1 = null;
    this.bp2 = null;
    this.pointer = null;
    this.offset = 0;
  }
}
