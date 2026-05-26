import { useCallback, useState } from "react";
import { useProjectStore } from "../../stores/projectStore";
import { useImagesStore } from "../../stores/imagesStore";
import { useMeasurementsStore } from "../../stores/measurementsStore";
import {
  exportMarkdown,
  exportCSV,
  currentFolderHandle,
  saveProject,
} from "../../services/projectService";
import { useGridStore } from "../../stores/gridStore";
import { useCalibrationStore } from "../../stores/calibrationStore";
import { canvasExport } from "../canvas/canvasExport";

export default function ProjectControls() {
  const name = useProjectStore((s) => s.name);
  const closeProject = useProjectStore((s) => s.closeProject);
  const images = useImagesStore((s) => s.images);
  const measurements = useMeasurementsStore((s) => s.measurements);
  const rows = useGridStore((s) => s.rows);
  const cols = useGridStore((s) => s.cols);
  const cellWidth = useGridStore((s) => s.cellWidth);
  const cellHeight = useGridStore((s) => s.cellHeight);
  const panX = useGridStore((s) => s.panX);
  const panY = useGridStore((s) => s.panY);
  const ratio = useCalibrationStore((s) => s.ratio);
  const displayZoom = useCalibrationStore((s) => s.displayZoom);
  const [exportOpen, setExportOpen] = useState(false);

  const handleSave = useCallback(async () => {
    if (!currentFolderHandle) return;
    await saveProject(currentFolderHandle, {
      name,
      grid: { rows, cols, cellWidth, cellHeight, panX, panY },
      calibration: { ratio, displayZoom },
      images,
      measurements,
    });
  }, [name, rows, cols, cellWidth, cellHeight, panX, panY, ratio, displayZoom, images, measurements]);

  const handleExport = useCallback(
    async (format: "md" | "csv") => {
      const content =
        format === "md"
          ? exportMarkdown(images, measurements)
          : exportCSV(images, measurements);

      const ext = format === "md" ? "md" : "csv";
      const mime =
        format === "md" ? "text/markdown" : "text/csv";
      const blob = new Blob([content], { type: mime });

      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: `measurements.${ext}`,
          types: [
            {
              description: format === "md" ? "Markdown" : "CSV",
              accept: { [mime]: [`.${ext}`] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch {
        // cancelled
      }
      setExportOpen(false);
    },
    [images, measurements],
  );

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <span className="text-gray-300 font-medium max-w-32 truncate">
        {name}
      </span>
      <button
        className="rounded bg-gray-800 px-2 py-0.5 hover:bg-gray-700"
        onClick={handleSave}
      >
        保存
      </button>
      <div className="relative">
        <button
          className="rounded bg-gray-800 px-2 py-0.5 hover:bg-gray-700"
          onClick={() => setExportOpen(!exportOpen)}
        >
          导出
        </button>
        {exportOpen && (
          <div className="absolute left-0 top-full mt-1 rounded bg-gray-800 shadow-lg z-10">
            <button
              className="block w-full px-3 py-1.5 text-left hover:bg-gray-700 whitespace-nowrap"
              onClick={() => handleExport("md")}
            >
              Markdown
            </button>
            <button
              className="block w-full px-3 py-1.5 text-left hover:bg-gray-700 whitespace-nowrap"
              onClick={() => handleExport("csv")}
            >
              CSV
            </button>
            <button
              className="block w-full px-3 py-1.5 text-left hover:bg-gray-700 whitespace-nowrap"
              onClick={() => { canvasExport.fn?.(); setExportOpen(false); }}
            >
              Image (PNG)
            </button>
          </div>
        )}
      </div>
      <button
        className="rounded bg-gray-800 px-2 py-0.5 hover:bg-gray-700 text-red-400"
        onClick={closeProject}
      >
        关闭
      </button>
    </div>
  );
}
