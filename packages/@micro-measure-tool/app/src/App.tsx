import { useState, useEffect, useRef } from "react";
import { useProjectStore } from "./stores/projectStore";
import { useGridStore } from "./stores/gridStore";
import { useCalibrationStore } from "./stores/calibrationStore";
import { useImagesStore } from "./stores/imagesStore";
import { useMeasurementsStore } from "./stores/measurementsStore";
import { initTools } from "./tools/init";
import { saveProject, currentFolderHandle } from "./services/projectService";
import StartupDialog from "./components/startup/StartupDialog";
import Toolbar from "./components/toolbar/Toolbar";
import CanvasArea from "./components/canvas/CanvasArea";
import SidePanel from "./components/side-panel/SidePanel";

export default function App() {
  const isOpen = useProjectStore((s) => s.isOpen);
  const name = useProjectStore((s) => s.name);
  const ratio = useCalibrationStore((s) => s.ratio);
  const displayZoom = useCalibrationStore((s) => s.displayZoom);
  const [showStartup, setShowStartup] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    initTools();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const measurements = useMeasurementsStore.getState().measurements;
    if (measurements.length === 0) return;
    let changed = false;
    const updated = measurements.map((m) => {
      if (m.type === "h-line" && "lengthPx" in m.data) {
        const newUm = (m.data.lengthPx / displayZoom) * ratio;
        if (Math.abs(m.data.lengthUm - newUm) > 0.001) {
          changed = true;
          return { ...m, data: { ...m.data, lengthUm: newUm } };
        }
      } else if (m.type === "constrained-circle" && "radiusPx" in m.data) {
        const newUm = (m.data.radiusPx * 2 / displayZoom) * ratio;
        if (Math.abs(m.data.diameterUm - newUm) > 0.001) {
          changed = true;
          return { ...m, data: { ...m.data, diameterUm: newUm } };
        }
      }
      return m;
    });
    if (changed) useMeasurementsStore.getState().setMeasurements(updated);
  }, [isOpen, ratio, displayZoom]);

  useEffect(() => {
    if (!isOpen) return;

    const unsubs = [
      useGridStore.subscribe(() => scheduleSave()),
      useCalibrationStore.subscribe(() => scheduleSave()),
      useImagesStore.subscribe(() => scheduleSave()),
      useMeasurementsStore.subscribe(() => scheduleSave()),
    ];

    function scheduleSave() {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        if (!currentFolderHandle) return;
        const grid = useGridStore.getState();
        const cal = useCalibrationStore.getState();
        const images = useImagesStore.getState().images;
        const measurements = useMeasurementsStore.getState().measurements;
        await saveProject(currentFolderHandle, {
          name,
          grid: {
            rows: grid.rows,
            cols: grid.cols,
            cellWidth: grid.cellWidth,
            cellHeight: grid.cellHeight,
            panX: grid.panX,
            panY: grid.panY,
          },
          calibration: { ratio: cal.ratio, displayZoom: cal.displayZoom },
          images,
          measurements,
        });
      }, 500);
    }

    return () => {
      unsubs.forEach((u) => u());
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [isOpen, name]);

  if (!isOpen || showStartup) {
    return (
      <StartupDialog
        onProjectOpened={() => setShowStartup(false)}
      />
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <CanvasArea />
        <SidePanel />
      </div>
    </div>
  );
}
