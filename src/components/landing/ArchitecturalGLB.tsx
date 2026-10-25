import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  url: string;
  targetSize?: number;
};

export default function ArchitecturalGLB({
  url,
  targetSize = 8,
}: Props) {
  const { scene } = useGLTF(url);

  // Clone the loaded scene so its transforms can be
  // controlled independently by the hero animation.
  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [model]);

  const normalized = useMemo(() => {
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    const largestDimension = Math.max(
      size.x,
      size.y,
      size.z,
      0.001
    );

    const scale = targetSize / largestDimension;

    return {
      scale,
      position: [
        -center.x * scale,
        -bounds.min.y * scale,
        -center.z * scale,
      ] as [number, number, number],
    };
  }, [model, targetSize]);

  return (
    <group>
      <primitive
        object={model}
        scale={normalized.scale}
        position={normalized.position}
      />
    </group>
  );
}
