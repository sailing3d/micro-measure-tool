import type { MeasurementTool } from "./types";

const registry = new Map<string, MeasurementTool>();

export function registerTool(tool: MeasurementTool): void {
  registry.set(tool.id, tool);
}

export function getTool(id: string): MeasurementTool | undefined {
  return registry.get(id);
}

export function getToolIds(): string[] {
  return Array.from(registry.keys());
}

export function getTools(): MeasurementTool[] {
  return Array.from(registry.values());
}
