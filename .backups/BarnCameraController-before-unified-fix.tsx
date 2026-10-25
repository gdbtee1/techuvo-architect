import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

type Props = {
  inside: boolean;
  width: number;
  length: number;
  controls: React.RefObject<OrbitControlsImpl | null>;
};

export default function BarnCameraController({
  inside,
  width,
  length,
  controls,
}: Props) {
  const { camera } = useThree();

  const destination = useRef(new THREE.Vector3());
  const targetRotation = useRef(new THREE.Quaternion());
  const exteriorTarget = useRef(new THREE.Vector3());

  const moving = useRef(false);

  useEffect(() => {
    const w = width * 0.3048;
    const l = length * 0.3048;

    if (inside) {
      // Place camera INSIDE the actual barn footprint.
      const insideZ = Math.max(
        -l / 2 + 2,
        l / 2 - 3.5
      );

      destination.current.set(
        0,
        1.7,
        insideZ
      );

      // Face the far interior wall.
      const lookAt = new THREE.Vector3(
        0,
        1.65,
        -l / 2 + 1
      );

      const dummyCamera = camera.clone();
      dummyCamera.position.copy(destination.current);
      dummyCamera.lookAt(lookAt);

      targetRotation.current.copy(
        dummyCamera.quaternion
      );
    } else {
      // Return to exterior overview.
      destination.current.set(
        Math.max(12, w * 1.15),
        Math.max(9, w * 0.65),
        Math.max(15, l * 1.1)
      );

      exteriorTarget.current.set(0, 2, 0);
    }

    moving.current = true;
  }, [inside, width, length, camera]);

  useFrame((_, delta) => {
    if (!moving.current) return;

    const alpha = 1 - Math.exp(-delta * 3);

    camera.position.lerp(
      destination.current,
      alpha
    );

    if (inside) {
      // We control the first-person camera directly.
      camera.quaternion.slerp(
        targetRotation.current,
        alpha
      );
    } else {
      // Synchronize the orbit target on exit.
      if (controls.current) {
        controls.current.target.lerp(
          exteriorTarget.current,
          alpha
        );
        controls.current.update();
      }
    }

    const arrived =
      camera.position.distanceTo(
        destination.current
      ) < 0.035;

    if (arrived) {
      camera.position.copy(destination.current);

      if (inside) {
        camera.quaternion.copy(
          targetRotation.current
        );
      } else if (controls.current) {
        controls.current.target.copy(
          exteriorTarget.current
        );
        controls.current.update();
      }

      moving.current = false;
    }
  });

  return null;
}
