import type { Point, MeasurementData } from "../types";
import type { MeasurementTool, ShapeData } from "./types";
import { useMeasurementsStore } from "../stores/measurementsStore";

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

  private hoveredTrajectory: [Point, Point] | null = null;

  onPointerDown(point: Point): void {
    if (this.phase === "idle") {
      if (this.hoveredTrajectory) {
        this.trajP1 = this.hoveredTrajectory[0];
        this.trajP2 = this.hoveredTrajectory[1];
        this.hoveredTrajectory = null;
        this.phase = "adjust";
        return;
      }
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
    if (this.phase === "idle") {
      this.hoveredTrajectory = this.findNearTrajectory(point);
      return;
    }
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

    if (this.hoveredTrajectory) {
      const [t1, t2] = this.hoveredTrajectory;
      shapes.push({
        id: "hover-traj",
        type: "line",
        props: {
          points: [t1.x, t1.y, t2.x, t2.y],
          stroke: "#06b6d4",
          strokeWidth: 4,
        },
      });
    }

    if (this.trajP1) {
      shapes.push({
        id: "traj-p1",
        type: "circle",
        props: { x: this.trajP1.x, y: this.trajP1.y, radius: 4, fill: "#6366f1" },
      });
    }

    if (this.trajP2) {
      shapes.push({
        id: "traj-p2",
        type: "circle",
        props: { x: this.trajP2.x, y: this.trajP2.y, radius: 4, fill: "#6366f1" },
      });
    }

    const end = this.trajP2 || this.trajPointer;
    if (this.trajP1 && end) {
      shapes.push({
        id: "trajectory",
        type: "line",
        props: {
          points: [this.trajP1.x, this.trajP1.y, end.x, end.y],
          stroke: "#6366f1",
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
          stroke: "#6366f1", strokeWidth: 1.5,
        },
      });
      shapes.push({
        id: "diameter-label",
        type: "text",
        props: {
          x: this.center.x + this.radius + 6,
          y: this.center.y - 8,
          text: `${(this.radius * 2).toFixed(1)}`,
          fontSize: 14,
          fontFamily: "Arial",
          fill: "#6366f1",
          stroke: "#ffffff",
          strokeWidth: 0.2,
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
    this.hoveredTrajectory = null;
  }

  private findNearTrajectory(point: Point): [Point, Point] | null {
    const measurements = useMeasurementsStore.getState().measurements;
    for (const m of measurements) {
      if (m.type === "constrained-circle" && "trajectory" in m.data) {
        const [a, b] = m.data.trajectory;
        const d = this.distToSegment(point, a, b);
        if (d < 10) return [a, b];
      }
    }
    return null;
  }

  private distToSegment(p: Point, a: Point, b: Point): number {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const lenSq = abx * abx + aby * aby;
    if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * abx;
    const py = a.y + t * aby;
    return Math.hypot(p.x - px, p.y - py);
  }
}
