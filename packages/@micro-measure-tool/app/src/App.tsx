import { useState, useEffect, useRef } from "react";
import { useProjectStore } from "./stores/projectStore";
import { useGridStore } from "./stores/gridStore";
import { useCalibrationStore } from "./stores/calibrationStore";
import { useImagesStore } from "./stores/imagesStore";
import { useMeasurementsStore } from "./stores/measurementsStore";
import { initTools } from "./tools/init";
import { saveProject, currentFolderHandle } from "./services/projectService";
import { getLastProject } from "./services/dbService";
import { openProject } from "./services/projectService";
import { readImageAsBlobUrl } from "./services/projectService";
import { clearLastProject } from "./services/dbService";
import StartupDialog from "./components/startup/StartupDialog";
import Toolbar from "./components/toolbar/Toolbar";
import CanvasArea from "./components/canvas/CanvasArea";
import SidePanel from "./components/side-panel/SidePanel";

export default function App() {
  const isOpen = useProjectStore((s) => s.isOpen);
  const name = useProjectStore((s) => s.name);
  const openProjectInStore = useProjectStore((s) => s.openProject);
  const ratio = useCalibrationStore((s) => s.ratio);
  const displayZoom = useCalibrationStore((s) => s.displayZoom);
  const [showStartup, setShowStartup] = useState(true);
  const [loading, setLoading] = useState(true);
  const [highlightedMeasurementId, setHighlightedMeasurementId] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const triedRestore = useRef(false);

  useEffect(() => {
    initTools();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      clearLastProject();
    }
  }, [isOpen]);

  useEffect(() => {
    if (triedRestore.current) return;
    triedRestore.current = true;

    (async () => {
      try {
        const saved = await getLastProject();
        if (!saved) { setLoading(false); return; }

        const result = await saved.handle.queryPermission({ mode: "readwrite" });
        if (result !== "granted") {
          const requestResult = await saved.handle.requestPermission({ mode: "readwrite" });
          if (requestResult !== "granted") { setLoading(false); return; }
        }

        const { data } = await openProject(saved.handle);
        populateStores(data, saved.handle);
        openProjectInStore(data.name);
        setShowStartup(false);
      } catch {
        // restore failed, show startup
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function populateStores(
    data: Awaited<ReturnType<typeof openProject>>["data"],
    handle: FileSystemDirectoryHandle,
  ) {
    const setRows = useGridStore.getState().setRows;
    const setCols = useGridStore.getState().setCols;
    const setCellWidth = useGridStore.getState().setCellWidth;
    const setCellHeight = useGridStore.getState().setCellHeight;
    const setRatio = useCalibrationStore.getState().setRatio;
    const setDisplayZoom = useCalibrationStore.getState().setDisplayZoom;
    const setBaseZoom = useCalibrationStore.getState().setBaseZoom;
    const setImages = useImagesStore.getState().setImages;
    const setMeasurements = useMeasurementsStore.getState().setMeasurements;

    setRows(data.grid.rows);
    setCols(data.grid.cols);
    setCellWidth(data.grid.cellWidth);
    setCellHeight(data.grid.cellHeight);
    setRatio(data.calibration.ratio);
    setDisplayZoom(data.displayZoom);
    setBaseZoom(data.displayZoom);
    setImages([]);
    setMeasurements([]);

    Promise.all(
      data.images.map(async (img) => {
        const filepath = await readImageAsBlobUrl(img.filename, handle);
        return { ...img, filepath };
      }),
    ).then((imgsWithUrls) => {
      setImages(imgsWithUrls);
      const allMeasurements = data.images.flatMap((img) => img.measurements);
      setMeasurements(allMeasurements);
    });
  }

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

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
        <CanvasArea
          highlightedMeasurementId={highlightedMeasurementId}
          onHighlightMeasurement={setHighlightedMeasurementId}
        />
        <SidePanel
          highlightedMeasurementId={highlightedMeasurementId}
          onHighlightMeasurement={setHighlightedMeasurementId}
        />
      </div>
    </div>
  );
}
