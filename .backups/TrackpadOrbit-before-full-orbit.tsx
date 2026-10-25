import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

type Props = {
  controls: React.RefObject<OrbitControlsImpl | null>;
  enabled: boolean;
};

export default function TrackpadOrbit({
  controls,
  enabled,
}: Props) {
  const { gl, camera } = useThree();
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    const element = gl.domElement;

    const onWheel = (event: WheelEvent) => {
      if (!enabledRef.current || !controls.current) return;

      // Allow browser pinch-to-zoom events to use
      // their default OrbitControls handling.
      if (event.ctrlKey) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const orbit = controls.current;

      // Horizontal two-finger movement rotates the orbit.
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        const offset = new THREE.Vector3().subVectors(
          camera.position,
          orbit.target
        );

        const angle = event.deltaX * 0.003;

        offset.applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          angle
        );

        camera.position.copy(
          orbit.target.clone().add(offset)
        );

        camera.lookAt(orbit.target);
        orbit.update();
      } else {
        // Vertical scrolling zooms smoothly.
        const direction = new THREE.Vector3()
          .subVectors(camera.position, orbit.target);

        const distance = direction.length();

        const nextDistance = THREE.MathUtils.clamp(
          distance * Math.exp(event.deltaY * 0.003),
          3,
          100
        );

        direction.normalize().multiplyScalar(nextDistance);

        camera.position.copy(
          orbit.target.clone().add(direction)
        );

        orbit.update();
      }
    };

    // Capture the event before OrbitControls handles it.
    element.addEventListener("wheel", onWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      element.removeEventListener("wheel", onWheel, true);
    };
  }, [gl, camera, controls]);

  return null;
}
