import { useState } from "react";
import Home from "./pages/Home";
import CompileMarker from "./pages/CompileMarker";

function App() {
  const [showCompiler, setShowCompiler] = useState(false);

  if (showCompiler) {
    return <CompileMarker />;
  }

  return (
    <div className="relative">
      <Home />
      <button
        type="button"
        onClick={() => setShowCompiler(true)}
        className="fixed bottom-4 left-4 z-50 px-3 py-1.5 text-xs rounded-full bg-slate-700/80 text-white"
      >
        Compile Marker (dev)
      </button>
    </div>
  );
}

export default App;