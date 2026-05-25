import type { ImageData, MeasurementData, GridState, CalibrationState } from "../types";

export let currentFolderHandle: FileSystemDirectoryHandle | null = null;

const INDEX_KEY = "micro-measure-tool-projects";

export interface ProjectData {
  version: number;
  name: string;
  grid: GridState;
  calibration: CalibrationState;
  displayZoom: number;
  images: (Omit<ImageData, "filepath"> & { measurements: MeasurementData[] })[];
}

function toProjectData(data: {
  name: string;
  grid: { rows: number; cols: number; cellWidth: number; cellHeight: number; panX: number; panY: number };
  calibration: { ratio: number; displayZoom: number };
  images: ImageData[];
  measurements: MeasurementData[];
}): ProjectData {
  return {
    version: 1,
    name: data.name,
    grid: {
      rows: data.grid.rows,
      cols: data.grid.cols,
      cellWidth: data.grid.cellWidth,
      cellHeight: data.grid.cellHeight,
      panX: 0,
      panY: 0,
    },
    calibration: { ratio: data.calibration.ratio, displayZoom: data.calibration.displayZoom },
    displayZoom: data.calibration.displayZoom,
    images: data.images.map((img) => ({
      id: img.id,
      filename: img.filename,
      cellIndex: img.cellIndex,
      offsetX: img.offsetX,
      offsetY: img.offsetY,
      rotation: img.rotation,
      scale: img.scale,
      measurements: data.measurements.filter((m) => m.imageId === img.id),
    })),
  };
}

export async function createProject(
  folderHandle: FileSystemDirectoryHandle,
  name: string,
): Promise<void> {
  const projectData: ProjectData = {
    version: 1,
    name,
    grid: { rows: 3, cols: 3, cellWidth: 600, cellHeight: 400, panX: 0, panY: 0 },
    calibration: { ratio: 1, displayZoom: 1 },
    displayZoom: 1,
    images: [],
  };

  const fileHandle = await folderHandle.getFileHandle("project.json", { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(projectData, null, 2));
  await writable.close();

  currentFolderHandle = folderHandle;
  saveProjectToIndex(name, folderHandle.name);
}

export async function openProject(
  folderHandle: FileSystemDirectoryHandle,
): Promise<{
  data: ProjectData;
  imageHandles: Map<string, FileSystemFileHandle>;
}> {
  currentFolderHandle = folderHandle;
  const fileHandle = await folderHandle.getFileHandle("project.json");
  const file = await fileHandle.getFile();
  const text = await file.text();
  const data: ProjectData = JSON.parse(text);

  const imageHandles = new Map<string, FileSystemFileHandle>();
  for (const img of data.images) {
    try {
      const h = await folderHandle.getFileHandle(img.filename);
      imageHandles.set(img.filename, h);
    } catch {
      // file may be missing
    }
  }

  return { data, imageHandles };
}

export async function saveProject(
  folderHandle: FileSystemDirectoryHandle,
  data: {
    name: string;
    grid: { rows: number; cols: number; cellWidth: number; cellHeight: number; panX: number; panY: number };
    calibration: { ratio: number; displayZoom: number };
    images: ImageData[];
    measurements: MeasurementData[];
  },
): Promise<void> {
  const projectData = toProjectData(data);
  const fileHandle = await folderHandle.getFileHandle("project.json", { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(projectData, null, 2));
  await writable.close();
}

export async function copyImageToProject(
  file: File,
  folderHandle: FileSystemDirectoryHandle,
): Promise<string> {
  const filename = file.name;
  const buffer = await file.arrayBuffer();
  const fileHandle = await folderHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(buffer);
  await writable.close();
  return filename;
}

export function listProjects(): { name: string; path: string }[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProjectToIndex(name: string, path: string): void {
  const projects = listProjects();
  const existing = projects.find((p) => p.path === path);
  if (existing) {
    existing.name = name;
  } else {
    projects.push({ name, path });
  }
  localStorage.setItem(INDEX_KEY, JSON.stringify(projects));
}

export function exportMarkdown(
  images: ImageData[],
  measurements: MeasurementData[],
): string {
  let md = `# 测量数据\n\n`;
  for (const img of images) {
    const imgMeasurements = measurements.filter((m) => m.imageId === img.id);
    if (imgMeasurements.length === 0) continue;
    md += `## ${img.filename}\n\n`;
    md += `| 名称 | 类型 | 值 |\n`;
    md += `|------|------|----|\n`;
    for (const m of imgMeasurements) {
      let value = "";
      if (m.type === "h-line" && "lengthUm" in m.data) {
        value = `${m.data.lengthUm.toFixed(2)} µm`;
      } else if (m.type === "constrained-circle" && "diameterUm" in m.data) {
        value = `${m.data.diameterUm.toFixed(2)} µm`;
      }
      md += `| ${m.name} | ${m.type} | ${value} |\n`;
    }
    md += `\n`;
  }
  return md;
}

export function exportCSV(
  images: ImageData[],
  measurements: MeasurementData[],
): string {
  let csv = "图片,测量名称,类型,值,单位\n";
  for (const img of images) {
    for (const m of measurements) {
      if (m.imageId !== img.id) continue;
      let value = "";
      if (m.type === "h-line" && "lengthUm" in m.data) {
        value = `${m.data.lengthUm.toFixed(2)}`;
      } else if (m.type === "constrained-circle" && "diameterUm" in m.data) {
        value = `${m.data.diameterUm.toFixed(2)}`;
      }
      csv += `${img.filename},${m.name},${m.type},${value},µm\n`;
    }
  }
  return csv;
}
