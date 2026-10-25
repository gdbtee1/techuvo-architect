import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

type Props = {
  inside: boolean;
  width: number;
  length: number;
  controls: React.RefObject<OrbitControlsImpl | null>;
  onTransitionComplete?: () => void;
  resetSignal?: number;
};

export default function BarnCameraController({
  inside,
  width,
  length,
  controls,
  onTransitionComplete,
  resetSignal = 0,
}: Props) {
  const { camera } = useThree();

  const destination = useRef(new THREE.Vector3());
  const targetQuaternion = useRef(new THREE.Quaternion());
  const targetPoint = useRef(new THREE.Vector3());
  const moving = useRef(false);

  const onComplete = useRef(onTransitionComplete);
  onComplete.current = onTransitionComplete;

  useEffect(() => {
    const w = width * 0.3048;
    const l = length * 0.3048;

    if (inside) {
      destination.current.set(
        0,
        1.7,
        Math.max(0, l / 2 - 4)
      );

      const lookAt = new THREE.Vector3(
        0,
        1.65,
        -l / 2 + 1
      );

      const dummy = camera.clone();
      dummy.position.copy(destination.current);
      dummy.lookAt(lookAt);

      targetQuaternion.current.copy(dummy.quaternion);
    } else {
      destination.current.set(
        Math.max(w * 1.15, 18),
        Math.max(w * 0.8, 12),
        Math.max(l * 1.25, 22)
      );

      targetPoint.current.set(0, 2, 0);

      const dummy = camera.clone();
      dummy.position.copy(destination.current);
      dummy.lookAt(targetPoint.current);

      targetQuaternion.current.copy(dummy.quaternion);
    }

    moving.current = true;
  }, [inside, resetSignal, camera]);

  useFrame((_, delta) => {
    if (!moving.current) return;

    const factor = 1 - Math.exp(-delta * 3.8);

    // Make OrbitControls release the camera during transitions.
    if (controls.current) {
      controls.current.enabled = false;
    }

    camera.position.lerp(destination.current, factor);
    camera.quaternion.slerp(
      targetQuaternion.current,
      factor
    );

    const positionDone =
      camera.position.distanceTo(destination.current) < 0.025;

    const rotationDone =
      camera.quaternion.angleTo(targetQuaternion.current) < 0.008;

    if (positionDone && rotationDone) {
      camera.position.copy(destination.current);
      camera.quaternion.copy(targetQuaternion.current);

      if (controls.current) {
        controls.current.target.copy(targetPoint.current);
        controls.current.enabled = !inside;
        if (!inside) controls.current.update();
      }

      moving.current = false;
      onComplete.current?.();
    }
  });

  return null;
}
