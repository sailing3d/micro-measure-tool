import { useState } from "react";
import { useShallow } from "zustand/shallow";
import { createProject, openProject, listProjects, readImageAsBlobUrl } from "../../services/projectService";
import { getProjectHandle } from "../../services/dbService";
import { useProjectStore } from "../../stores/projectStore";
import { useGridStore } from "../../stores/gridStore";
import { useCalibrationStore } from "../../stores/calibrationStore";
import { useImagesStore } from "../../stores/imagesStore";
import { useMeasurementsStore } from "../../stores/measurementsStore";

interface Props {
  onProjectOpened: () => void;
}

export default function StartupDialog({ onProjectOpened }: Props) {
  const [mode, setMode] = useState<"idle" | "new" | "openRecent">("idle");
  const [projectName, setProjectName] = useState("");
  const [recentProjects] = useState(() => listProjects());

  const openProjectInStore = useProjectStore((s) => s.openProject);
  const { setRows, setCols, setCellWidth, setCellHeight } = useGridStore(
    useShallow((s) => ({
      setRows: s.setRows,
      setCols: s.setCols,
      setCellWidth: s.setCellWidth,
      setCellHeight: s.setCellHeight,
    })),
  );
  const setCanvasScale = useGridStore((s) => s.setCanvasScale);
  const { setRatio, setDisplayZoom } = useCalibrationStore(
    useShallow((s) => ({
      setRatio: s.setRatio,
      setDisplayZoom: s.setDisplayZoom,
    })),
  );
  const setImages = useImagesStore((s) => s.setImages);
  const setMeasurements = useMeasurementsStore((s) => s.setMeasurements);

  async function handleNew() {
    if (!projectName.trim()) return;
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      await createProject(handle, projectName);
      openProjectInStore(projectName);
      setRows(3);
      setCols(3);
      setCellWidth(600);
      setCellHeight(400);
      setRatio(1);
      setDisplayZoom(1);
      setImages([]);
      setMeasurements([]);
      onProjectOpened();
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Failed to create project:", err);
      }
    }
  }

  async function handleRecent(name: string) {
    try {
      const handle = await getProjectHandle(name);
      if (handle) {
        const res = await handle.queryPermission({ mode: "readwrite" });
        if (res !== "granted") {
          const reqRes = await handle.requestPermission({ mode: "readwrite" });
          if (reqRes !== "granted") throw new Error("permission denied");
        }
        const { data } = await openProject(handle);
        openProjectInStore(data.name);
        setRows(data.grid.rows);
        setCols(data.grid.cols);
        setCellWidth(data.grid.cellWidth);
        setCellHeight(data.grid.cellHeight);
        setCanvasScale(data.grid.canvasScale);
        setRatio(data.calibration.ratio);
        setDisplayZoom(data.displayZoom);
        const imgs = await Promise.all(
          data.images.map(async (img) => {
            const fp = await readImageAsBlobUrl(img.filename, handle);
            return { ...img, filepath: fp };
          }),
        );
        setImages(imgs);
        const allMs = data.images.flatMap((img) => img.measurements);
        setMeasurements(allMs);
        onProjectOpened();
      } else {
        await handleOpen();
      }
    } catch {
      await handleOpen();
    }
  }

  async function handleOpen() {
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      const { data } = await openProject(handle);
      openProjectInStore(data.name);
      setRows(data.grid.rows);
      setCols(data.grid.cols);
      setCellWidth(data.grid.cellWidth);
      setCellHeight(data.grid.cellHeight);
      setRatio(data.calibration.ratio);
      setDisplayZoom(data.displayZoom);

      const imgsWithUrls = await Promise.all(
        data.images.map(async (img) => {
          const filepath = await readImageAsBlobUrl(img.filename, handle);
          return { ...img, filepath };
        }),
      );
      setImages(imgsWithUrls);
      const allMeasurements = data.images.flatMap((img) => img.measurements);
      setMeasurements(allMeasurements);
      onProjectOpened();
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Failed to open project:", err);
      }
    }
  }

  if (mode === "new") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="rounded-lg bg-gray-900 p-8 shadow-xl w-96">
          <h2 className="mb-4 text-lg font-semibold">新建项目</h2>
          <label className="block mb-2 text-sm text-gray-400">项目名称</label>
          <input
            className="w-full rounded bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="输入项目名称"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleNew()}
          />
          <div className="mt-4 flex gap-2">
            <button
              className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500"
              onClick={handleNew}
              disabled={!projectName.trim()}
            >
              选择文件夹并创建
            </button>
            <button
              className="rounded bg-gray-700 px-4 py-2 text-sm hover:bg-gray-600"
              onClick={() => setMode("idle")}
            >
              返回
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            选择或创建一个空文件夹作为项目目录, 项目文件将保存在其中.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-950">
      <div className="rounded-lg bg-gray-900 p-8 shadow-xl w-96">
        <h1 className="mb-6 text-center text-xl font-bold">Micro Measure Tool</h1>
        <div className="flex flex-col gap-3">
          <button
            className="rounded bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500"
            onClick={() => setMode("new")}
          >
            新建项目
          </button>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500"
            onClick={handleOpen}
          >
            打开已有项目
          </button>
        </div>
        {recentProjects.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm text-gray-400">最近项目</h3>
            <div className="space-y-1">
              {recentProjects.map((p) => (
                <button
                  key={p.path}
                  className="block w-full rounded px-2 py-1 text-left text-sm text-gray-300 hover:bg-gray-800"
                  onClick={() => handleRecent(p.name)}
                >
                  {p.name}
                  <span className="ml-2 text-xs text-gray-600">{p.path}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
