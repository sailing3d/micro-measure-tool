import { HLineTool } from "./hLineTool";
import { ConstrainedCircleTool } from "./constrainedCircleTool";
import { registerTool } from "./registry";

export function initTools(): void {
  registerTool(new HLineTool());
  registerTool(new ConstrainedCircleTool());
}
