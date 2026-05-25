import { useState } from "react";
import { useImagesStore } from "../../stores/imagesStore";

export default function ImageList() {
  const images = useImagesStore((s) => s.images);
  const updateImage = useImagesStore((s) => s.updateImage);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function startRename(id: string, current: string) {
    setEditId(id);
    setEditName(current);
  }

  function commitRename() {
    if (editId && editName.trim()) {
      updateImage(editId, { filename: editName.trim() });
    }
    setEditId(null);
  }

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        图片
      </h3>
      {images.length === 0 && (
        <p className="text-xs text-gray-600">拖入图片到格子</p>
      )}
      <ul className="space-y-0.5">
        {images.map((img) => (
          <li
            key={img.id}
            className="rounded px-2 py-1 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer"
            onDoubleClick={() => startRename(img.id, img.filename)}
          >
            {editId === img.id ? (
              <input
                className="w-full rounded bg-gray-800 px-1 py-0 text-sm text-gray-200 outline-none"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => e.key === "Enter" && commitRename()}
                autoFocus
              />
            ) : (
              <span className="truncate block">{img.filename}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
