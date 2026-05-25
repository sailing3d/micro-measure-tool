import ImageList from "./ImageList";

export default function SidePanel() {
  return (
    <div className="w-64 border-l border-gray-800 bg-gray-900 p-3 flex flex-col gap-4 overflow-y-auto">
      <ImageList />
      <div className="border-t border-gray-800 pt-4">
        <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          测量结果
        </h3>
        <p className="text-xs text-gray-600">暂无测量</p>
      </div>
    </div>
  );
}
