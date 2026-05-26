import { useEffect } from "react";

export default function HelpDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="max-h-[80vh] w-[420px] overflow-y-auto rounded-lg bg-gray-900 p-6 shadow-xl text-sm text-gray-300" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-100">帮助</h2>
          <button className="text-gray-500 hover:text-gray-300" onClick={onClose}>ESC</button>
        </div>

        <div className="space-y-4">
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-1">图片操作</h3>
            <ul className="space-y-0.5 text-gray-400">
              <li><kbd className="text-gray-200">拖放文件</kbd> 到格子 → 添加图片</li>
              <li><kbd className="text-gray-200">左键拖拽</kbd> 图片 → 移动 / 换格子</li>
              <li><kbd className="text-gray-200">右键拖拽</kbd> 空白区 → 平移画布</li>
              <li><kbd className="text-gray-200">Ctrl+滚轮</kbd> → 缩放画布</li>
              <li>选中图片后右上角 <kbd className="text-gray-200">✕</kbd> 删除 / <kbd className="text-gray-200">0</kbd> 重置位置</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-1">标定 & 缩放</h3>
            <ul className="space-y-0.5 text-gray-400">
              <li><kbd className="text-gray-200">µm/px</kbd> 直接输入比例或 <kbd className="text-gray-200">画线标定</kbd></li>
              <li><kbd className="text-gray-200">Zoom</kbd> 统一缩放所有图片, <kbd className="text-gray-200">↺</kbd> 恢复默认</li>
              <li>标定值基于真实图片像素, 缩放不影响测量</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-1">测量工具</h3>
            <ul className="space-y-0.5 text-gray-400">
              <li><span className="text-teal-400">距离测量</span> — 点两点定基线 → 移动鼠标调平行线 → 点击确认 (H 型)</li>
              <li><span className="text-indigo-400">限定圆</span> — 点两点定轨迹 → 移动调圆心/半径 → 点击确认</li>
              <li>限定圆模式下悬停已有轨迹线可复用</li>
              <li>点击已选工具或按 <kbd className="text-gray-200">ESC</kbd> 退出</li>
              <li>悬停测量图形 ↔ 侧栏数据行 双向高亮</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-1">数据</h3>
            <ul className="space-y-0.5 text-gray-400">
              <li><kbd className="text-gray-200">保存</kbd> 手动写入 project.json</li>
              <li><kbd className="text-gray-200">导出</kbd> Markdown / CSV / PNG 图片</li>
              <li>测量序号不重用, 删除后不补位</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
