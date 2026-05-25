import type { Point, MeasurementData } from "../types";
import type { MeasurementTool, ShapeData } from "./types";

type Phase = "idle" | "trajectory" | "adjust";

export class ConstrainedCircleTool implements MeasurementTool {
  id = "constrained-circle";
  name = "限定圆";

  private phase: Phase = "idle";
  private trajectoryStart: Point | null = null;
  private trajectoryEnd: Point | null = null;
  private center: Point | null = null;
  private radius = 0;

  onPointerDown(point: Point): void {
    if (this.phase === "idle") {
      this.trajectoryStart = point;
      this.trajectoryEnd = point;
      this.phase = "trajectory";
    }
  }

  onPointerMove(point: Point): void {
    if (this.phase === "trajectory") {
      this.trajectoryEnd = point;
      return;
    }
    if (this.phase === "adjust" && this.trajectoryStart && this.trajectoryEnd) {
      const tx = this.trajectoryStart.x;
      const ty = this.trajectoryStart.y;
      const tdx = this.trajectoryEnd.x - tx;
      const tdy = this.trajectoryEnd.y - ty;
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
    if (this.phase === "trajectory") {
      if (!this.trajectoryStart || !this.trajectoryEnd) return null;
      this.phase = "adjust";
      return null;
    }
    if (this.phase === "adjust" && this.center && this.radius > 0) {
      const data: MeasurementData = {
        id: `meas-${Date.now()}`,
        imageId: "",
        name: "",
        type: "constrained-circle",
        data: {
          trajectory: [this.trajectoryStart!, this.trajectoryEnd!],
          center: this.center,
          radiusPx: this.radius,
          diameterUm: 0,
        },
      };
      this.reset();
      return data;
    }
    return null;
  }

  getPreview(): ShapeData[] {
    const shapes: ShapeData[] = [];

    if (this.trajectoryStart && this.trajectoryEnd) {
      shapes.push({
        id: "trajectory",
        type: "line",
        props: {
          points: [
            this.trajectoryStart.x,
            this.trajectoryStart.y,
            this.trajectoryEnd.x,
            this.trajectoryEnd.y,
          ],
          stroke: "#3b82f6",
          strokeWidth: 2,
          dash: [6, 3],
        },
      });
    }

    if (this.phase === "adjust" && this.center) {
      shapes.push({
        id: "preview-circle",
        type: "circle",
        props: {
          x: this.center.x,
          y: this.center.y,
          radius: this.radius,
          stroke: "#3b82f6",
          strokeWidth: 1.5,
        },
      });
    }

    return shapes;
  }

  reset(): void {
    this.phase = "idle";
    this.trajectoryStart = null;
    this.trajectoryEnd = null;
    this.center = null;
    this.radius = 0;
  }
}
