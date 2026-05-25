import { useState } from "react";
import { useProjectStore } from "./stores/projectStore";
import StartupDialog from "./components/startup/StartupDialog";
import Toolbar from "./components/toolbar/Toolbar";
import CanvasArea from "./components/canvas/CanvasArea";
import SidePanel from "./components/side-panel/SidePanel";

export default function App() {
  const isOpen = useProjectStore((s) => s.isOpen);
  const [showStartup, setShowStartup] = useState(true);

  if (!isOpen || showStartup) {
    return <StartupDialog onProjectOpened={() => setShowStartup(false)} />;
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
