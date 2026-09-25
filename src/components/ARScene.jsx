import { useCallback, useEffect, useRef, useState } from "react";
import CameraView from "./CameraView";
import MarkerTracker from "./MarkerTracker";
import AROverlayUI from "./AROverlayUI";

export default function ARScene({ item, imageTargetSrc, modelConfig, onExit }) {
  const containerRef = useRef(null);
  const cleanupRef = useRef(null);
  const foundRef = useRef(false);
  const lostTimerRef = useRef(null);
  const [isTargetFound, setIsTargetFound] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const videoControlRef = useRef(null);
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoNeedsGesture, setVideoNeedsGesture] = useState(false);
  // Items with BOTH video + model run a sequence: video plays on the card
  // first, the 3D model appears after the user taps Next
  const sequenced = !!(item?.video && item?.model);
  const [stage, setStage] = useState(sequenced ? "video" : null);

  useEffect(() => {
    return () => {
      if (lostTimerRef.current) {
        clearTimeout(lostTimerRef.current);
        lostTimerRef.current = null;
      }
    };
  }, []);

  const handleTargetFound = useCallback(() => {
    if (lostTimerRef.current) {
      clearTimeout(lostTimerRef.current);
      lostTimerRef.current = null;
    }
    if (!foundRef.current) {
      foundRef.current = true;
      setIsTargetFound(true);
    }
  }, [setIsTargetFound]);

  const handleTargetLost = useCallback(() => {
    if (!foundRef.current || lostTimerRef.current) return;
    lostTimerRef.current = setTimeout(() => {
      foundRef.current = false;
      setIsTargetFound(false);
      lostTimerRef.current = null;
    }, 600);
  }, [setIsTargetFound]);

  const activeItem = item || {
    title: "AR Flashcard",
    category: "flashcard",
    description: "Scan the card marker to view 3D model",
  };

  const handleHotspotTap = useCallback(
    (key, name) => {
      const map = activeItem?.hotspots;
      if (!map) return;
      if (key && map[key]) {
        setActiveHotspot({ key, selId: Date.now(), ...map[key] });
      } else if (name) {
        // Fallback: tapped a named object that isn't in the hotspot map
        const pretty = name.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
        setActiveHotspot({
          key: null,
          selId: Date.now(),
          title: pretty,
          type: "Object",
          script: `This is ${pretty}.`,
        });
      }
    },
    [activeItem]
  );

  const handleCloseHotspot = useCallback(() => setActiveHotspot(null), []);

  // Content map for this item's marker session:
  // - item.targets (explicit multi-target map) wins
  // - item.video → single video plane on target index 0
  // - otherwise MarkerTracker defaults to the 3D model on target index 0
  const derivedTargets =
    activeItem.targets ??
    (activeItem.video
      ? activeItem.model
        ? [
            { targetIndex: 0, ...activeItem.video },
            { targetIndex: 0, type: "model" },
          ]
        : [{ targetIndex: 0, ...activeItem.video }]
      : undefined);

  const handleToggleVideoMute = useCallback(() => {
    videoControlRef.current?.toggleMute();
  }, []);

  const handlePlayVideo = useCallback(() => {
    videoControlRef.current?.play();
  }, []);

  const handleExit = () => {
    cleanupRef.current?.();
    onExit?.();
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-black z-50">
      <CameraView ref={containerRef} />
      <MarkerTracker
        containerRef={containerRef}
        imageTargetSrc={imageTargetSrc || activeItem.markerUrl}
        modelConfig={modelConfig || activeItem.model}
        active
        onCleanupRef={cleanupRef}
        onTargetFound={handleTargetFound}
        onTargetLost={handleTargetLost}
        onHotspotTap={handleHotspotTap}
        hotspots={activeItem.hotspots}
        selectedKey={activeHotspot ? activeHotspot.key ?? activeHotspot.title : null}
        targets={derivedTargets}
        videoControlRef={videoControlRef}
        onVideoMutedChange={setVideoMuted}
        onVideoNeedsGesture={setVideoNeedsGesture}
        stage={stage}
      />

      {/* Interactive AR Overlay HUD */}
      <AROverlayUI
        item={activeItem}
        isTargetFound={isTargetFound}
        activeHotspot={activeHotspot}
        onCloseHotspot={handleCloseHotspot}
        videoMuted={videoMuted}
        videoNeedsGesture={videoNeedsGesture}
        onToggleVideoMute={handleToggleVideoMute}
        onPlayVideo={handlePlayVideo}
        onExit={handleExit}
        stage={stage}
        onNext={() => setStage("model")}
        onPrev={() => setStage("video")}
      />

      <style>{`
        @keyframes scanline {
          0% { top: 6%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 94%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}