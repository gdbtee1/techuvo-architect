import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
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
  const transitioning = useRef(true);
  const target = useRef(new THREE.Vector3());
  const destination = useRef(new THREE.Vector3());

  useEffect(() => {
    const l = length * 0.3048;

    destination.current.set(
      inside ? 0 : 20,
      inside ? 1.8 : 15,
      inside ? Math.max(0, l / 2 - 3) : 23
    );

    target.current.set(
      0,
      inside ? 1.6 : 2,
      inside ? -Math.min(l / 2 - 1, 5) : 0
    );

    transitioning.current = true;
  }, [inside, width, length]);

  useFrame((_, delta) => {
    if (!transitioning.current) return;

    const factor = 1 - Math.exp(-delta * 2.8);

    camera.position.lerp(destination.current, factor);

    if (controls.current) {
      controls.current.target.lerp(target.current, factor);
      controls.current.update();
    }

    if (
      camera.position.distanceTo(destination.current) < 0.04 &&
      (!controls.current ||
        controls.current.target.distanceTo(target.current) < 0.04)
    ) {
      camera.position.copy(destination.current);

      if (controls.current) {
        controls.current.target.copy(target.current);
        controls.current.update();
      }

      transitioning.current = false;
    }
  });

  return null;
}
