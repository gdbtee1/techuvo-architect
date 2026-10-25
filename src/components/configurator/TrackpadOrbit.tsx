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
    const canvas = gl.domElement;

    const onWheel = (event: WheelEvent) => {
      if (!enabledRef.current || !controls.current) return;

      // Trackpad scrolling controls orbit.
      // Ctrl+wheel is commonly used for pinch zoom on macOS.
      if (event.ctrlKey) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const orbit = controls.current;

      const offset = new THREE.Vector3().subVectors(
        camera.position,
        orbit.target
      );

      const spherical = new THREE.Spherical().setFromVector3(
        offset
      );

      // Horizontal movement: rotate around building.
      spherical.theta += event.deltaX * 0.004;

      // Vertical movement: change camera elevation.
      spherical.phi += event.deltaY * 0.004;

      // Prevent upside-down orbiting.
      spherical.phi = THREE.MathUtils.clamp(
        spherical.phi,
        0.12,
        Math.PI / 2.03
      );

      spherical.makeSafe();

      offset.setFromSpherical(spherical);

      camera.position.copy(
        orbit.target.clone().add(offset)
      );

      camera.lookAt(orbit.target);
      orbit.update();
    };

    canvas.addEventListener("wheel", onWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      canvas.removeEventListener("wheel", onWheel, true);
    };
  }, [gl, camera, controls]);

  return null;
}
