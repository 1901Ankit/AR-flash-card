import { useCallback, useState } from "react";

export const CAMERA_STATUS = {
  IDLE: "idle",
  REQUESTING: "requesting",
  GRANTED: "granted",
  DENIED: "denied",
  UNSUPPORTED: "unsupported",
};

export default function useCamera() {
  const [status, setStatus] = useState(CAMERA_STATUS.IDLE);
  const [error, setError] = useState(null);

  const requestCameraPermission = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus(CAMERA_STATUS.UNSUPPORTED);
      setError("Camera API is not supported in this browser.");
      return false;
    }

    setStatus(CAMERA_STATUS.REQUESTING);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      stream.getTracks().forEach((track) => track.stop());
      setStatus(CAMERA_STATUS.GRANTED);
      return true;
    } catch (err) {
      setStatus(CAMERA_STATUS.DENIED);
      setError(err?.message || "Camera permission was denied.");
      return false;
    }
  }, []);

  return { status, error, requestCameraPermission };
}