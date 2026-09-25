import { useEffect, useRef } from "react";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import * as THREE from "three";
import { buildModel, animateModel } from "./ModelViewer";
import { matchHotspotKey } from "../data/arCatalog";
const MODEL_BASE_SCALE = 1.0;

export default function MarkerTracker({
  containerRef,
  imageTargetSrc,
  modelConfig,
  hotspots,
  selectedKey,
  targets,
  stage,
  videoControlRef,
  onVideoMutedChange,
  onVideoNeedsGesture,
  onTargetFound,
  onTargetLost,
  onHotspotTap,
  active,
  onCleanupRef,
}) {
  const mindarRef = useRef(null);
  const videoRef = useRef(null);
  const clearHighlightRef = useRef(null);
  // Read inside the render loop so switching video -> model never restarts
  // the MindAR session (null = no staging, show everything)
  const stageRef = useRef(null);

  useEffect(() => {
    stageRef.current = stage ?? null;
  }, [stage]);

  useEffect(() => {
    if (selectedKey == null) clearHighlightRef.current?.();
  }, [selectedKey]);

  useEffect(() => {
    if (!active || !containerRef.current) return undefined;

    let isCancelled = false;
    let mindarThree = null;
    let modelObject = null;
    let videoStates = []; 
    let downHandler = null;
    let upHandler = null;
    let cancelHandlerRef = () => {
      downPos = null;
    };
    let highlighted = null;
    let selectedTarget = null;
    let downPos = null;
    let lastTapTime = 0;
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const hardStop = (instance) => {
      if (!instance) return;
      try {
        instance.renderer?.setAnimationLoop(null);
      } catch {}
      try {
        instance.stop();
      } catch {}
      try {
        const video = instance.video || videoRef.current;
        if (video) {
          videoRef.current = video;
          const stream = video.srcObject;
          if (stream?.getTracks) {
            stream.getTracks().forEach((track) => track.stop());
          }
          video.srcObject = null;
          video.pause();
        }
      } catch {}
      try {
        instance.renderer?.dispose();
      } catch {}
    };

    const stopAllCameraTracks = () => {
      try {
        const mediaDevices = navigator.mediaDevices;
        if (!mediaDevices) return;
        document.querySelectorAll("video").forEach((video) => {
          const stream = video.srcObject;
          if (stream?.getTracks) {
            stream.getTracks().forEach((track) => track.stop());
          }
          video.srcObject = null;
          video.remove();
        });
      } catch {}
    };

    const handleResize = () => {
      if (mindarThree?.renderer && mindarThree?.camera) {
        const width = containerRef.current?.clientWidth || window.innerWidth;
        const height = containerRef.current?.clientHeight || window.innerHeight;
        mindarThree.renderer.setSize(width, height);
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    const cleanup = () => {
      console.log("[MarkerTracker] Cleanup called, stopping camera...");
      isCancelled = true;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      const tapSurface = containerRef.current;
      if (tapSurface) {
        if (downHandler) tapSurface.removeEventListener("pointerdown", downHandler);
        if (upHandler) tapSurface.removeEventListener("pointerup", upHandler);
        tapSurface.removeEventListener("pointercancel", cancelHandlerRef);
      }
      clearHighlightRef.current = null;
      hardStop(mindarThree);
      stopAllCameraTracks();

      videoStates.forEach((s) => {
        s.el?.pause();
        s.el?.removeAttribute("src");
        s.el?.load();
        s.el?.remove(); 
        s.tex?.dispose();
      });
      videoStates = [];
      if (videoControlRef) videoControlRef.current = null;

      mindarRef.current = null;
      window.__arCurrentModel = null;

      if (videoRef.current) {
        console.log("[MarkerTracker] Removing stored video element");
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.remove();
        videoRef.current = null;
      }

      document.querySelectorAll("video").forEach((video) => {
        video.pause();
        video.srcObject = null;
        video.remove();
      });

      document.querySelectorAll(".mindar-ui-overlay, .mindar-ui-scanning, .mindar-ui-loading").forEach((el) => {
        el.remove();
      });

      console.log("[MarkerTracker] Cleanup complete");
    };

    if (onCleanupRef) {
      onCleanupRef.current = cleanup;
    }

    const start = async () => {
      mindarThree = new MindARThree({
        container: containerRef.current,
        imageTargetSrc,
        uiScanning: "no",
        uiLoading: "no",
      });
      mindarRef.current = mindarThree;
      if (isCancelled) {
        hardStop(mindarThree);
        return;
      }

      const { renderer, scene, camera } = mindarThree;
      renderer.setClearColor(0x000000, 0);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
      const mainLight = new THREE.DirectionalLight(0xffffff, 0.65);
      mainLight.position.set(1, 2, 2);
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
      fillLight.position.set(-1, -1, 1);
      scene.add(ambientLight, mainLight, fillLight);


      const targetDefs = targets?.length
        ? targets
        : [{ targetIndex: 0, type: "model" }];

      const smoothStates = [];
      const newSmoothState = (a, group, kind) => {
        const s = {
          anchor: a,
          group,
          kind,
          found: false,
          lastSeenAt: 0,
          poseInit: false,
          smPos: new THREE.Vector3(),
          smQuat: new THREE.Quaternion(),
          smScale: new THREE.Vector3(1, 1, 1),
        };
        smoothStates.push(s);
        return s;
      };

      const modelDef = targetDefs.find((t) => t.type === "model");
      let anchor = null;
      let modelState = null;
      if (modelDef) {
        anchor = mindarThree.addAnchor(modelDef.targetIndex ?? 0);
        modelObject = await buildModel(modelConfig);

        if (isCancelled) {
          hardStop(mindarThree);
          return;
        }

      modelObject.scale.setScalar(MODEL_BASE_SCALE);
        window.__arBaseScale = MODEL_BASE_SCALE;
        window.__arScaleMult = 1;

        const smoothGroup = new THREE.Group();
        smoothGroup.visible = false;
        scene.add(smoothGroup);
        smoothGroup.add(modelObject);
        modelState = newSmoothState(anchor, smoothGroup, "model");
        window.__arCurrentModel = modelObject;
      }

      let videoExplicitMuted = false;
      let videoGestureUnlocked = false;
      let firstVideoEl = null;
      const tryPlayVideo = (el) => {
        const p = el.play();
        if (p?.then) {
          p.then(() => onVideoNeedsGesture?.(false)).catch(() => {
            onVideoNeedsGesture?.(true);
          });
        }
      };

      targetDefs
        .filter((t) => t.type === "video" && t.src)
        .forEach((def) => {
          const vAnchor = mindarThree.addAnchor(def.targetIndex);
          const el = document.createElement("video");
          el.src = def.src;
          el.muted = true; 
          el.setAttribute("muted", ""); 
          el.playsInline = true;
          el.setAttribute("playsinline", "");
          el.setAttribute("webkit-playsinline", "");
          el.loop = def.loop !== false;
          el.preload = "auto";
          el.style.cssText =
            "position:fixed;bottom:0;right:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1;";
          containerRef.current?.appendChild(el);

          el.addEventListener("error", () => {
            console.error(
              "[MarkerTracker] card-video element error:",
              el.error?.code,
              el.error?.message
            );
          });

          const tex = new THREE.VideoTexture(el);
          tex.encoding = THREE.sRGBEncoding;
          // CRITICAL: video frames are usually non-power-of-2 — mipmapping
          // makes the texture incomplete → plane renders black
          tex.minFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          // MindAR normalizes target width to 1 unit — plane width 1 spans the
          // card exactly; height comes from the marker's aspect ratio. Start
          // with def.aspect/fallback — corrected to the .mind file's real
          // marker dimensions after start() below.
          let aspect = def.aspect || 1.5;
          // Start MAGENTA — the video texture is attached only once a frame
          // actually decodes (videoWidth > 0). Diagnostic:
          //   magenta rectangle on card = plane renders, codec undecodable
          //   nothing at all            = pose/visibility issue
          const planeMat = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            toneMapped: false,
            depthWrite: false, // never occludes other content
            side: THREE.DoubleSide, // visible even if the pose flips the plane
          });
          const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1 / aspect),
            planeMat
          );
          plane.renderOrder = -1;
          plane.position.z = 0.001; // hair above the card — no z-fighting

          const attachTexture = () => {
            if (el.videoWidth > 0 && !planeMat.map) {
              planeMat.map = tex;
              planeMat.color.set(0xffffff);
              planeMat.needsUpdate = true;
            }
          };
          el.addEventListener("loadedmetadata", attachTexture);
          el.addEventListener("loadeddata", attachTexture);
          el.addEventListener("canplay", attachTexture);

          // Crop the video texture so it fills the plane edge-to-edge
          const applyCoverFit = () => {
            const vw = el.videoWidth;
            const vh = el.videoHeight;
            if (!vw || !vh) return;
            const videoAspect = vw / vh;
            if (videoAspect > aspect) {
              tex.repeat.set(aspect / videoAspect, 1); // crop left/right
            } else {
              tex.repeat.set(1, videoAspect / aspect); // crop top/bottom
            }
            tex.offset.set(
              (1 - tex.repeat.x) / 2,
              (1 - tex.repeat.y) / 2
            );
          };
          if ((def.fit || "cover") === "cover") {
            if (el.readyState >= 1) applyCoverFit();
            else {
              el.addEventListener("loadedmetadata", applyCoverFit, {
                once: true,
              });
            }
          }

          const vGroup = new THREE.Group();
          vGroup.visible = false;
          scene.add(vGroup);
          vGroup.add(plane);

          const state = newSmoothState(vAnchor, vGroup, "video");
          state.el = el;
          state.tex = tex;
          state.def = def;
          // Resize the plane to a new aspect and re-crop the texture
          state.applyAspect = (newAspect) => {
            if (!newAspect || Math.abs(newAspect - aspect) < 1e-3) return;
            aspect = newAspect;
            plane.geometry.dispose();
            plane.geometry = new THREE.PlaneGeometry(1, 1 / aspect);
            if ((def.fit || "cover") === "cover") applyCoverFit();
          };
          videoStates.push(state);

          vAnchor.onTargetFound = () => {
            if (state.found) return;
            state.found = true;
            onTargetFound?.(); // drive shared UI state for video-only items
            // Autoplay only while the video stage is active (sequenced items
            // may already be on the model stage when the target is re-found)
            if (
              def.autoplay !== false &&
              (!stageRef.current || stageRef.current === "video")
            )
              tryPlayVideo(el); // resume — currentTime never reset
            // Debug: verify decode + texture wiring (remove after confirming)
            const logVideo = (tag) =>
              console.log(`[MarkerTracker] card-video ${tag}:`, {
                readyState: el.readyState,
                videoWidth: el.videoWidth,
                videoHeight: el.videoHeight,
                paused: el.paused,
                currentTime: +el.currentTime.toFixed(2),
                networkState: el.networkState,
                error: el.error?.code ?? null,
                texImageIsEl: tex.image === el,
                planeVisible: vGroup.visible,
              });
            logVideo("target-found");
            setTimeout(() => {
              logVideo("+1s");
              if (!el.paused && el.videoWidth === 0) {
                console.warn(
                  "[MarkerTracker] AUDIO PLAYS BUT VIDEO TRACK IS NOT DECODING " +
                    "(videoWidth=0) — codec unsupported by this browser. " +
                    "Re-encode: ffmpeg -i jiraiya.mp4 -c:v libx264 -profile:v main -pix_fmt yuv420p -c:a aac jiraiya-h264.mp4"
                );
              }
            }, 1000);
          };
          vAnchor.onTargetLost = () => {
            if (!state.found) return;
            state.found = false;
            state.lastSeenAt = performance.now();
            el.pause(); // pause only — resumes from same spot on reacquire
            onTargetLost?.();
          };

          if (!firstVideoEl) firstVideoEl = el;
        });

      if (videoControlRef) {
        videoControlRef.current = firstVideoEl
          ? {
              play: () => tryPlayVideo(firstVideoEl),
              toggleMute: () => {
                firstVideoEl.muted = !firstVideoEl.muted;
                videoExplicitMuted = firstVideoEl.muted; // explicit user choice
                onVideoMutedChange?.(firstVideoEl.muted);
                return firstVideoEl.muted;
              },
            }
          : null;
      }

      // Log every node name so hotspot keys can be verified against the GLB
      if (modelObject) {
        const nodeNames = [];
        modelObject.traverse((child) => {
          if (child.name) nodeNames.push(child.name);
        });
        console.log("[MarkerTracker] Model node names:", nodeNames);
      }

      // --- Planet registry: top-level named nodes matching hotspot keys ---
      const planetRegistry = [];
      if (hotspots && modelObject) {
        const registered = new Set();
        modelObject.traverse((child) => {
          if (!child.name || registered.has(child)) return;
          const key = matchHotspotKey(child.name, hotspots);
          if (!key) return;
          // Keep only top-level matches — skip nodes nested under a registered planet
          let anc = child.parent;
          let nested = false;
          while (anc && anc !== modelObject) {
            if (registered.has(anc)) {
              nested = true;
              break;
            }
            anc = anc.parent;
          }
          if (nested) return;
          registered.add(child);
          planetRegistry.push({ key, name: child.name, object3D: child });
        });

        // Coverage pass: if some/all nodes didn't match a key, register the
        // sibling mesh-bearing children of the shallowest "split" node so every
        // planet is still independently tappable (generic panel via name fallback)
        const hasMesh = (node) => {
          let found = false;
          node.traverse((c) => {
            if (c.isMesh) found = true;
          });
          return found;
        };
        let splitNode = null;
        modelObject.traverse((node) => {
          if (splitNode) return;
          const meshKids = node.children.filter(hasMesh);
          if (meshKids.length >= 2) splitNode = node;
        });
        if (splitNode) {
          splitNode.children.forEach((child) => {
            if (registered.has(child) || !hasMesh(child)) return;
            let containsRegistered = false;
            child.traverse((c) => {
              if (registered.has(c)) containsRegistered = true;
            });
            if (containsRegistered) return;
            registered.add(child);
            planetRegistry.push({
              key: matchHotspotKey(child.name || "", hotspots),
              name: child.name || `Object ${planetRegistry.length + 1}`,
              object3D: child,
            });
          });
        }

        // World-space bounding sphere per planet (tap fallback + highlight sizing)
        modelObject.updateMatrixWorld(true);
        const tmpScale = new THREE.Vector3();
        planetRegistry.forEach((p) => {
          p.boundingSphere = new THREE.Box3()
            .setFromObject(p.object3D)
            .getBoundingSphere(new THREE.Sphere());
          p.object3D.getWorldScale(tmpScale);
          p.worldScale = tmpScale.x || 1;
        });
        console.log(
          "[MarkerTracker] Planet registry:",
          planetRegistry.map((p) => `${p.key || "?"} <- "${p.name}"`)
        );
      }

      // --- Selection highlight: pulsing emissive tint (no transform changes) ---
      const clearHighlight = () => {
        if (!highlighted) return;
        highlighted.originals.forEach(({ mat, emissive, intensity }) => {
          mat.emissive.copy(emissive);
          mat.emissiveIntensity = intensity;
        });
        highlighted = null;
        selectedTarget = null;
      };
      clearHighlightRef.current = clearHighlight;

      const applyHighlight = (root) => {
        clearHighlight();
        const originals = [];
        root.traverse((child) => {
          if (!child.isMesh || !child.material || Array.isArray(child.material)) return;
          // Clone once so shared materials aren't permanently tinted
          if (!child.userData.__hlCloned) {
            child.material = child.material.clone();
            child.userData.__hlCloned = true;
          }
          const mat = child.material;
          if (mat.emissive) {
            originals.push({
              mat,
              emissive: mat.emissive.clone(),
              intensity: mat.emissiveIntensity ?? 0,
            });
            mat.emissive.setHex(0x8b5cf6);
            mat.emissiveIntensity = 0.35;
          }
        });
        highlighted = originals.length ? { originals, t: 0 } : null;
        selectedTarget = root;
      };

      const handleTap = (event) => {
        if (stageRef.current && stageRef.current !== "model") return;
        if (!hotspots || !modelObject || !camera || !renderer?.domElement) return;
        const rect = renderer.domElement.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        // Raycast the model; empty space / card background yields no hits
        const hits = raycaster.intersectObject(modelObject, true);

        let entry = null;
        let target = null;

        if (hits.length > 0) {
          // Walk up to the nearest registered planet root
          let obj = hits[0].object;
          while (obj && obj !== modelObject) {
            entry = planetRegistry.find((p) => p.object3D === obj) || null;
            if (entry) break;
            obj = obj.parent;
          }
          if (entry) {
            target = entry.object3D;
          } else {
            // Fallback: nearest named ancestor (hotspot key match wins)
            obj = hits[0].object;
            while (obj && obj !== modelObject) {
              if (obj.name) {
                if (!target) target = obj;
                const key = matchHotspotKey(obj.name, hotspots);
                if (key) {
                  entry = { key, name: obj.name, object3D: obj };
                  target = obj;
                  break;
                }
              }
              obj = obj.parent;
            }
          }
        }

        // Screen-space fallback: nearest planet center within its projected radius
        if (!target && planetRegistry.length) {
          const tapX = event.clientX - rect.left;
          const tapY = event.clientY - rect.top;
          const wp = new THREE.Vector3();
          const ws = new THREE.Vector3();
          const proj = new THREE.Vector3();
          let best = null;
          let bestDist = Infinity;
          planetRegistry.forEach((p) => {
            p.object3D.getWorldPosition(wp);
            const depth = wp.distanceTo(camera.position);
            if (depth <= 0.001) return;
            p.object3D.getWorldScale(ws);
            const radius = p.boundingSphere.radius * (ws.x / (p.worldScale || 1));
            const projRadius = Math.min(
              120,
              Math.max(
                28,
                (radius / depth) *
                  (rect.height / 2) /
                  Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5))
              )
            );
            proj.copy(wp).project(camera);
            const sx = (proj.x * 0.5 + 0.5) * rect.width;
            const sy = (-proj.y * 0.5 + 0.5) * rect.height;
            const d = Math.hypot(sx - tapX, sy - tapY);
            if (d < projRadius && d < bestDist) {
              bestDist = d;
              best = p;
            }
          });
          if (best) {
            entry = best;
            target = best.object3D;
          }
        }

        if (!target) {
          console.log("[MarkerTracker] Tap ignored — no planet under tap point");
          return; // empty space / unnamed object — ignore
        }

        console.log(
          "[MarkerTracker] Planet tapped:",
          entry?.key || "(no key)",
          "<-",
          entry?.name ?? target.name
        );

        // Guard: ignore taps within 150ms of the previous accepted tap
        const now = performance.now();
        if (now - lastTapTime < 150) return;
        lastTapTime = now;

        // Same planet re-tapped: keep highlight, just re-fire narration
        if (selectedTarget === target) {
          onHotspotTap?.(entry?.key ?? null, entry?.name ?? target.name);
          return;
        }

        applyHighlight(target);
        onHotspotTap?.(entry?.key ?? null, entry?.name ?? target.name);
      };

      // Tap vs drag: only a short, nearly-stationary press counts as a select
      downHandler = (e) => {
        // First tap on the AR surface = the browser's required user gesture:
        // unmute the card video (unless the user explicitly muted it) and
        // retry play() in case autoplay was blocked earlier.
        if (
          firstVideoEl &&
          !videoGestureUnlocked &&
          (!stageRef.current || stageRef.current === "video")
        ) {
          videoGestureUnlocked = true;
          if (!videoExplicitMuted) {
            firstVideoEl.muted = false;
            onVideoMutedChange?.(false);
          }
          tryPlayVideo(firstVideoEl);
        }
        downPos = { x: e.clientX, y: e.clientY, t: performance.now() };
      };
      upHandler = (e) => {
        if (!downPos) return;
        const dx = e.clientX - downPos.x;
        const dy = e.clientY - downPos.y;
        const dt = performance.now() - downPos.t;
        downPos = null;
        if (Math.hypot(dx, dy) > 8 || dt > 300) return; // drag, not a tap
        handleTap(e);
      };
      // Listen on the container — MindAR's <video> sits on top of the canvas,
      // so canvas-level listeners would never fire. Events bubble up here.
      const tapSurface = containerRef.current;
      tapSurface.addEventListener("pointerdown", downHandler);
      tapSurface.addEventListener("pointerup", upHandler);
      tapSurface.addEventListener("pointercancel", cancelHandlerRef);

      if (anchor && modelState) {
        anchor.onTargetFound = () => {
          if (modelState.found) return;
          modelState.found = true;
          // Re-apply default scale baseline × current user multiplier
          if (modelObject) {
            modelObject.scale.setScalar(
              (window.__arBaseScale ?? MODEL_BASE_SCALE) *
                (window.__arScaleMult ?? 1)
            );
          }
          onTargetFound?.();
        };
        anchor.onTargetLost = () => {
          if (!modelState.found) return;
          modelState.found = false;
          modelState.lastSeenAt = performance.now();
          onTargetLost?.();
        };
      }

      await mindarThree.start();

      if (isCancelled) {
        hardStop(mindarThree);
        return;
      }

      // Snap video planes to the REAL marker dimensions baked into the .mind
      // file ([width, height] px per target) — covers the card edge-to-edge,
      // portrait or landscape. Skipped when the item sets an explicit `aspect`.
      const markerDims = mindarThree.controller?.markerDimensions;
      if (Array.isArray(markerDims)) {
        console.log("[MarkerTracker] .mind marker dimensions:", markerDims);
        videoStates.forEach((s) => {
          const d = markerDims[s.def.targetIndex ?? 0];
          if (s.def.aspect == null && d?.[0] && d?.[1]) {
            s.applyAspect(d[0] / d[1]);
          }
        });
      }

      // --- Pose smoothing state (kills MindAR per-frame jitter) ---
      const rawPos = new THREE.Vector3();
      const rawQuat = new THREE.Quaternion();
      const rawScale = new THREE.Vector3();
      const POS_EPS = 0.006; // dead-zone: ignore micro position noise
      const ROT_EPS = 0.015; // dead-zone: ignore micro rotation noise (~0.9°)
      const POS_RANGE = 0.05; // delta at which tracking becomes fully responsive
      const ROT_RANGE = 0.12;
      const MIN_ALPHA = 0.04; // near-frozen for tiny deltas (jitter)
      const MAX_ALPHA = 0.4; // responsive for real card movement
      const SCALE_ALPHA = 0.15; // low-pass on scale so size doesn't shimmer

      renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        const now = performance.now();

        
        for (const s of smoothStates) {
      
          const tracked = s.found || now - s.lastSeenAt < 500;
          // Sequenced items show only the active stage's content;
          // unsequenced items (stageRef null) show everything as before
          s.group.visible =
            tracked && (!stageRef.current || s.kind === stageRef.current);
          if (!tracked) {
            s.poseInit = false;
            continue;
          }


          s.anchor.group.matrixWorld.decompose(rawPos, rawQuat, rawScale);
          if (rawScale.lengthSq() <= 1e-10) continue;

          if (!s.poseInit) {
            s.smPos.copy(rawPos);
            s.smQuat.copy(rawQuat);
            s.smScale.copy(rawScale);
            s.poseInit = true;
          } else {
            const dist = s.smPos.distanceTo(rawPos);
            if (dist > POS_EPS) {
              const a =
                MIN_ALPHA +
                (MAX_ALPHA - MIN_ALPHA) *
                  Math.min(1, (dist - POS_EPS) / POS_RANGE);
              s.smPos.lerp(rawPos, a);
            }
            const ang = s.smQuat.angleTo(rawQuat);
            if (ang > ROT_EPS) {
              const a =
                MIN_ALPHA +
                (MAX_ALPHA - MIN_ALPHA) *
                  Math.min(1, (ang - ROT_EPS) / ROT_RANGE);
              s.smQuat.slerp(rawQuat, a);
            }
            s.smScale.lerp(rawScale, SCALE_ALPHA);
          }
          s.group.position.copy(s.smPos);
          s.group.quaternion.copy(s.smQuat);
          s.group.scale.copy(s.smScale);
        }

     
        for (const s of videoStates) {
          // Pause video when its stage is hidden (e.g. user pressed Next)
          if (
            s.el &&
            stageRef.current &&
            s.kind !== stageRef.current &&
            !s.el.paused
          ) {
            s.el.pause();
          }
          // Resume playback when returning to the video stage (Prev)
          if (
            s.el &&
            stageRef.current === "video" &&
            s.el.paused &&
            (s.found || now - s.lastSeenAt < 500) &&
            s.def?.autoplay !== false
          ) {
            tryPlayVideo(s.el);
          }
          if (s.tex && s.el && !s.el.paused && s.el.readyState >= 2) {
            s.tex.needsUpdate = true;
          }
        }

        // Pulse the selected planet's emissive highlight (material-only, no transforms)
        if (highlighted) {
          highlighted.t += delta;
          const pulse = 0.35 + 0.25 * Math.sin(highlighted.t * 4);
          highlighted.originals.forEach(({ mat }) => {
            mat.emissiveIntensity = pulse;
          });
        }

        animateModel(modelObject, delta);
        renderer.render(scene, camera);
      });
    };

    start().catch((err) => {
      console.error("MindAR failed to start:", err);
    });

    return cleanup;
  }, [active, imageTargetSrc]);

  return null;
}