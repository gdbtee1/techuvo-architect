import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

export type CameraView =
  | "perspective"
  | "front"
  | "side"
  | "top";

type Props = {
  width: number;
  length: number;
  floors: number;
  floorHeight: number;
  selectedFloor: number;
  view: CameraView;
  resetToken: number;
};

export default function UniversalCamera({
  width,
  length,
  floors,
  floorHeight,
  selectedFloor,
  view,
  resetToken,
}: Props) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, gl, size } = useThree();

  const bounds = useMemo(() => {
    const height = floors * floorHeight;
    const radius = Math.hypot(width, length, height) / 2;

    return {
      height,
      distance: Math.max(radius * 2.8, 16),
    };
  }, [width, length, floors, floorHeight]);

  // Camera presets and automatic building framing.
  useEffect(() => {
    const control = controls.current;
    if (!control) return;

    const targetY =
      view === "top"
        ? (selectedFloor - 0.5) * floorHeight
        : bounds.height / 2;

    const target = new THREE.Vector3(0, targetY, 0);
    const d = bounds.distance;

    const positions: Record<CameraView, THREE.Vector3> = {
      perspective: new THREE.Vector3(
        d * 0.75,
        targetY + d * 0.55,
        d * 0.8
      ),
      front: new THREE.Vector3(0, targetY, d),
      side: new THREE.Vector3(d, targetY, 0),
      top: new THREE.Vector3(0, targetY + d, 0.01),
    };

    camera.position.copy(positions[view]);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.near = 0.1;
      camera.far = Math.max(1000, d * 6);
      camera.aspect = size.width / Math.max(size.height, 1);
      camera.updateProjectionMatrix();
    }

    control.target.copy(target);
    control.update();
  }, [
    camera,
    size.width,
    size.height,
    bounds,
    selectedFloor,
    floorHeight,
    view,
    resetToken,
  ]);

  // Mac trackpad:
  // Two-finger swipe = rotate.
  // Pinch gesture = zoom.
  // Mouse dragging remains handled by OrbitControls.
  useEffect(() => {
    const canvas = gl.domElement;

    function handleWheel(event: WheelEvent) {
      const control = controls.current;
      if (!control || !control.enabled) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const offset = camera.position
        .clone()
        .sub(control.target);

      const spherical = new THREE.Spherical()
        .setFromVector3(offset);

      if (event.ctrlKey) {
        const zoom = Math.exp(event.deltaY * 0.008);

        spherical.radius = THREE.MathUtils.clamp(
          spherical.radius * zoom,
          control.minDistance,
          control.maxDistance
        );
      } else {
        // Horizontal swipes orbit horizontally.
        spherical.theta -= event.deltaX * 0.005;

        // Vertical swipes orbit vertically.
        spherical.phi -= event.deltaY * 0.005;

        spherical.phi = THREE.MathUtils.clamp(
          spherical.phi,
          0.02,
          Math.PI - 0.02
        );
      }

      camera.position
        .copy(control.target)
        .add(new THREE.Vector3().setFromSpherical(spherical));

      control.update();
    }

    canvas.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      canvas.removeEventListener(
        "wheel",
        handleWheel,
        true
      );
    };
  }, [camera, gl]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.09}
      enableRotate
      enableZoom={false}
      enablePan
      rotateSpeed={0.8}
      panSpeed={0.75}
      minDistance={1}
      maxDistance={Math.max(300, bounds.distance * 5)}
      minPolarAngle={0.01}
      maxPolarAngle={Math.PI - 0.01}
      screenSpacePanning
    />
  );
}
