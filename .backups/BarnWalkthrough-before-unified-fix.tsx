import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type WalkDirection =
  | "forward"
  | "backward"
  | "left"
  | "right";

type Props = {
  active: boolean;
  width: number;
  length: number;
  input: React.MutableRefObject<
    Record<WalkDirection, boolean>
  >;
};

export default function BarnWalkthrough({
  active,
  width,
  length,
  input,
}: Props) {
  const { camera } = useThree();
  const yaw = useRef(0);
  const wasActive = useRef(false);

  useEffect(() => {
    if (!active) {
      wasActive.current = false;
      return;
    }

    // Capture camera orientation when entering.
    // This avoids snapping back to an arbitrary direction.
    if (!wasActive.current) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      yaw.current = Math.atan2(
        -forward.x,
        -forward.z
      );
      wasActive.current = true;
    }
  }, [active, camera]);

  useEffect(() => {
    if (!active) return;

    const keyMap: Record<string, WalkDirection> = {
      KeyW: "forward",
      ArrowUp: "forward",
      KeyS: "backward",
      ArrowDown: "backward",
      KeyA: "left",
      ArrowLeft: "left",
      KeyD: "right",
      ArrowRight: "right",
    };

    const down = (event: KeyboardEvent) => {
      const direction = keyMap[event.code];
      if (!direction) return;

      // Do not capture keys while editing a form.
      const element = event.target;
      if (
        element instanceof HTMLElement &&
        element.closest("input, select, textarea")
      ) {
        return;
      }

      event.preventDefault();
      input.current[direction] = true;
    };

    const up = (event: KeyboardEvent) => {
      const direction = keyMap[event.code];
      if (direction) input.current[direction] = false;
    };

    const clear = () => {
      for (const key of Object.keys(input.current) as WalkDirection[]) {
        input.current[key] = false;
      }
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      clear();
    };
  }, [active, input]);

  useFrame((_, delta) => {
    if (!active) return;

    const dt = Math.min(delta, 0.05);
    const speed = 2.2;
    const turnSpeed = 1.55;

    // Turning
    if (input.current.left) {
      yaw.current += turnSpeed * dt;
    }

    if (input.current.right) {
      yaw.current -= turnSpeed * dt;
    }

    camera.rotation.set(0, yaw.current, 0, "YXZ");

    // Walking
    let movement = 0;

    if (input.current.forward) movement += 1;
    if (input.current.backward) movement -= 1;

    const forward = new THREE.Vector3(
      -Math.sin(yaw.current),
      0,
      -Math.cos(yaw.current)
    );

    const nextPosition = camera.position
      .clone()
      .addScaledVector(forward, movement * speed * dt);

    const halfW = width * 0.3048 / 2;
    const halfL = length * 0.3048 / 2;

    const padding = 0.65;

    camera.position.x = THREE.MathUtils.clamp(
      nextPosition.x,
      -halfW + padding,
      halfW - padding
    );

    camera.position.z = THREE.MathUtils.clamp(
      nextPosition.z,
      -halfL + padding,
      halfL - padding
    );

    camera.position.y = 1.7;
  });

  return null;
}
