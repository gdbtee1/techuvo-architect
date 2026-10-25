import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { BarnView } from "./BarnViewToolbar";

type Props = {
  view: BarnView;
  revision: number;
  width: number;
  length: number;
  height: number;
  zoomRevision: number;
  zoomDirection: "in" | "out";
  controls: React.RefObject<OrbitControlsImpl | null>;
};

export default function BarnViewController({
  view,
  revision,
  width,
  length,
  height,
  zoomRevision,
  zoomDirection,
  controls,
}: Props) {
  const { camera } = useThree();

  useEffect(() => {
    const w = width * 0.3048;
    const l = length * 0.3048;
    const h = height * 0.3048;

    const radius = Math.hypot(w, l, h + w * 0.32) / 2;
    const distance = Math.max(18, radius * 2.4);
    const target = new THREE.Vector3(0, h * 0.5, 0);

    const positions: Record<BarnView, THREE.Vector3> = {
      overview: new THREE.Vector3(
        distance * 0.75,
        distance * 0.55,
        distance * 0.85
      ),
      front: new THREE.Vector3(0, h * 0.6, distance),
      side: new THREE.Vector3(distance, h * 0.6, 0),
      top: new THREE.Vector3(0.001, distance, 0),
      dollhouse: new THREE.Vector3(
        distance * 0.28,
        distance * 0.58,
        distance * 0.36
      ),
    };

    camera.position.copy(positions[view]);
    camera.up.set(0, 1, 0);
    camera.lookAt(target);

    if (controls.current) {
      controls.current.target.copy(target);
      controls.current.update();
    }
  }, [view, revision, width, length, height, camera, controls]);

  useEffect(() => {
    // Ignore the initial mount; zoom only after a button press.
    if (zoomRevision === 0 || !controls.current) return;

    const orbit = controls.current;
    const offset = camera.position.clone().sub(orbit.target);

    const factor = zoomDirection === "in" ? 0.8 : 1.25;
    const nextDistance = THREE.MathUtils.clamp(
      offset.length() * factor,
      2,
      150
    );

    offset.setLength(nextDistance);
    camera.position.copy(orbit.target.clone().add(offset));
    orbit.update();
  }, [zoomRevision, zoomDirection, camera, controls]);

  return null;
}
