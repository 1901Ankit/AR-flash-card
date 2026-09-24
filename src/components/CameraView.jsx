import { forwardRef, useEffect, useRef } from "react";

const CameraView = forwardRef(function CameraView(_props, ref) {
  const innerRef = useRef(null);

  useEffect(() => {
    const node = innerRef.current;
    return () => {
      if (node) {
        node.innerHTML = "";
      }
      // Aggressively stop all video elements when unmounting
      document.querySelectorAll("video").forEach((video) => {
        video.pause();
        const stream = video.srcObject;
        if (stream?.getTracks) {
          stream.getTracks().forEach((track) => track.stop());
        }
        video.srcObject = null;
        video.remove();
      });
    };
  }, []);

  return (
    <div
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className="fixed inset-0 w-screen h-dvh overflow-hidden bg-black"
    />
  );
});

export default CameraView;