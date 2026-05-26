import type { Point, MeasurementData } from "../types";
import type { MeasurementTool, ShapeData } from "./types";

type Phase = "idle" | "trajectory" | "adjust";

export class ConstrainedCircleTool implements MeasurementTool {
  id = "constrained-circle";
  name = "限定圆";

  private phase: Phase = "idle";
  private trajP1: Point | null = null;
  private trajP2: Point | null = null;
  private trajPointer: Point | null = null;
  private center: Point | null = null;
  private radius = 0;
  private pendingConfirm = false;

  onPointerDown(point: Point): void {
    if (this.phase === "idle") {
      this.trajP1 = point;
      this.trajPointer = point;
      this.phase = "trajectory";
    } else if (this.phase === "trajectory") {
      this.trajP2 = point;
    } else if (this.phase === "adjust") {
      this.pendingConfirm = true;
    }
  }

  onPointerMove(point: Point): void {
    if (this.phase === "trajectory") {
      this.trajPointer = point;
      return;
    }
    if (this.phase === "adjust" && this.trajP1 && this.trajP2) {
      const tx = this.trajP1.x;
      const ty = this.trajP1.y;
      const tdx = this.trajP2.x - tx;
      const tdy = this.trajP2.y - ty;
      const tLen = Math.sqrt(tdx * tdx + tdy * tdy);
      if (tLen === 0) return;

      const tux = tdx / tLen;
      const tuy = tdy / tLen;
      const dx = point.x - tx;
      const dy = point.y - ty;
      const proj = dx * tux + dy * tuy;
      const clampedProj = Math.max(0, Math.min(tLen, proj));

      this.center = {
        x: tx + tux * clampedProj,
        y: ty + tuy * clampedProj,
      };
      const perpX = dx - tux * proj;
      const perpY = dy - tuy * proj;
      this.radius = Math.sqrt(perpX * perpX + perpY * perpY);
    }
  }

  onPointerUp(): MeasurementData | null {
    if (this.phase === "trajectory" && this.trajP1 && this.trajP2) {
      this.phase = "adjust";
      return null;
    }
    if (this.phase === "adjust" && this.pendingConfirm && this.center && this.radius > 0) {
      this.pendingConfirm = false;
      const data: MeasurementData = {
        id: `meas-${Date.now()}`,
        imageId: "",
        name: "",
        type: "constrained-circle",
        data: {
          trajectory: [this.trajP1!, this.trajP2!],
          center: { ...this.center },
          radiusPx: this.radius,
          diameterUm: 0,
        },
      };
      this.center = null;
      this.radius = 0;
      return data;
    }
    return null;
  }

  getPreview(): ShapeData[] {
    const shapes: ShapeData[] = [];

    if (this.trajP1) {
      shapes.push({
        id: "traj-p1",
        type: "circle",
        props: { x: this.trajP1.x, y: this.trajP1.y, radius: 4, fill: "#3b82f6" },
      });
    }

    if (this.trajP2) {
      shapes.push({
        id: "traj-p2",
        type: "circle",
        props: { x: this.trajP2.x, y: this.trajP2.y, radius: 4, fill: "#3b82f6" },
      });
    }

    const end = this.trajP2 || this.trajPointer;
    if (this.trajP1 && end) {
      shapes.push({
        id: "trajectory",
        type: "line",
        props: {
          points: [this.trajP1.x, this.trajP1.y, end.x, end.y],
          stroke: "#3b82f6",
          strokeWidth: 2,
          ...(this.trajP2 ? {} : { dash: [6, 3] }),
        },
      });
    }

    if (this.phase === "adjust" && this.center) {
      shapes.push({
        id: "preview-circle",
        type: "circle",
        props: {
          x: this.center.x, y: this.center.y, radius: this.radius,
          stroke: "#3b82f6", strokeWidth: 1.5,
        },
      });
    }

    return shapes;
  }

  reset(): void {
    this.phase = "idle";
    this.trajP1 = null;
    this.trajP2 = null;
    this.trajPointer = null;
    this.center = null;
    this.radius = 0;
    this.pendingConfirm = false;
  }
}
