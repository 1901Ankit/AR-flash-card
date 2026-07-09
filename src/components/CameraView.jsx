import { forwardRef } from "react";

const CameraView = forwardRef(function CameraView(_props, ref) {
  return (
    <div
      ref={ref}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-black"
    />
  );
});

export default CameraView;