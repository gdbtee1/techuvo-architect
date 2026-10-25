import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { detectPlanarRooms } from "../../engine/geometry/planarRooms";
import type { PlanarRoom } from "../../engine/geometry/planarRooms";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Grid,
  OrbitControls,
} from "@react-three/drei";

import { useArchitectStore } from "../../store/useArchitectStore";
import type { Wall, Opening } from "../../types/architecture";

function ArchitecturalWall({
  wall,
  openings,
}: {
  wall: Wall;
  openings: Opening[];
}) {
  const dx = wall.end.x - wall.start.x;
  const dz = wall.end.y - wall.start.y;
  const length = Math.hypot(dx, dz);

  if (length < 0.001) return null;

  const centerX = (wall.start.x + wall.end.x) / 2;
  const centerZ = (wall.start.y + wall.end.y) / 2;
  const rotation = -Math.atan2(dz, dx);

  const material = "#e4ded3";
  const frameColor = "#e5e7e8";

  const validOpenings = openings
    .filter((opening) => opening.wallId === wall.id)
    .filter((opening) => {
      const left = opening.offset - opening.width / 2;
      const right = opening.offset + opening.width / 2;

      return (
        left >= 0 &&
        right <= length &&
        opening.sillHeight >= 0 &&
        opening.sillHeight + opening.height <= wall.height
      );
    })
    .sort((a, b) => a.offset - b.offset);

  function wallBox(
    key: string,
    x: number,
    bottom: number,
    width: number,
    height: number
  ) {
    if (width <= 0.001 || height <= 0.001) return null;

    return (
      <mesh
        key={key}
        position={[x, bottom + height / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, height, wall.thickness]} />
        <meshStandardMaterial
          color={material}
          roughness={0.85}
        />
      </mesh>
    );
  }

  const pieces: React.ReactNode[] = [];
  let cursor = 0;

  validOpenings.forEach((opening) => {
    const left = opening.offset - opening.width / 2;
    const right = opening.offset + opening.width / 2;

    // Prevent overlapping geometry if old data is invalid.
    if (left < cursor - 0.001) return;

    const beforeWidth = left - cursor;

    if (beforeWidth > 0.001) {
      pieces.push(
        wallBox(
          `solid-${opening.id}`,
          (cursor + left) / 2 - length / 2,
          0,
          beforeWidth,
          wall.height
        )
      );
    }

    // Wall below a window.
    if (opening.sillHeight > 0) {
      pieces.push(
        wallBox(
          `sill-${opening.id}`,
          opening.offset - length / 2,
          0,
          opening.width,
          opening.sillHeight
        )
      );
    }

    // Wall above a door or window.
    const topStart = opening.sillHeight + opening.height;
    const topHeight = wall.height - topStart;

    if (topHeight > 0.001) {
      pieces.push(
        wallBox(
          `header-${opening.id}`,
          opening.offset - length / 2,
          topStart,
          opening.width,
          topHeight
        )
      );
    }

    const frameDepth = wall.thickness + 0.035;
    const frameWidth = 0.055;
    const baseY = opening.sillHeight;
    const localX = opening.offset - length / 2;

    // Basic opening surround.
    pieces.push(
      <group key={`frame-${opening.id}`}>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[
              localX + side * (opening.width / 2),
              baseY + opening.height / 2,
              0,
            ]}
            castShadow
          >
            <boxGeometry
              args={[frameWidth, opening.height, frameDepth]}
            />
            <meshStandardMaterial color={frameColor} />
          </mesh>
        ))}

        <mesh
          position={[
            localX,
            baseY + opening.height,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[opening.width + frameWidth, frameWidth, frameDepth]}
          />
          <meshStandardMaterial color={frameColor} />
        </mesh>

        {opening.type === "window" && (
          <>
            <mesh
              position={[
                localX,
                baseY + opening.height / 2,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  opening.width - frameWidth,
                  opening.height - frameWidth,
                  0.014,
                ]}
              />
              <meshPhysicalMaterial
                color="#b9dce7"
                transparent
                opacity={0.35}
                metalness={0}
                roughness={0.08}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>

            <mesh position={[localX, baseY, 0]}>
              <boxGeometry
                args={[
                  opening.width + frameWidth,
                  frameWidth,
                  frameDepth,
                ]}
              />
              <meshStandardMaterial color={frameColor} />
            </mesh>
          </>
        )}
      </group>
    );

    cursor = right;
  });

  if (cursor < length) {
    pieces.push(
      wallBox(
        "final-solid",
        (cursor + length) / 2 - length / 2,
        0,
        length - cursor,
        wall.height
      )
    );
  }

  return (
    <group
      position={[centerX, 0, centerZ]}
      rotation={[0, rotation, 0]}
    >
      {pieces}
    </group>
  );
}

function ArchitecturalFloor({
  room,
}: {
  room: PlanarRoom;
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();

    room.points.forEach((point, index) => {
      if (index === 0) {
        shape.moveTo(point.x, point.y);
      } else {
        shape.lineTo(point.x, point.y);
      }
    });

    shape.closePath();

    const result = new THREE.ShapeGeometry(shape);

    // ShapeGeometry uses the XY plane.
    // Rotate geometry into our XZ ground plane.
    result.rotateX(Math.PI / 2);

    return result;
  }, [room]);

  return (
    <mesh
      geometry={geometry}
      position={[0, 0.025, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        color="#d4b99a"
        roughness={0.9}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}


type CameraView = "overview" | "top" | "interior";

function CameraController({
  view,
  resetVersion,
  centerX,
  centerZ,
  radius,
}: {
  view: CameraView;
  resetVersion: number;
  centerX: number;
  centerZ: number;
  radius: number;
}) {
  const { camera, gl } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    const distance = Math.max(radius * 1.65, 7);

    const target = new THREE.Vector3(
      centerX,
      0.9,
      centerZ
    );

    let position: THREE.Vector3;

    if (view === "top") {
      position = new THREE.Vector3(
        centerX,
        distance * 1.7,
        centerZ + 0.001
      );
    } else if (view === "interior") {
      position = new THREE.Vector3(
        centerX + distance * 0.58,
        Math.max(4.2, distance * 0.9),
        centerZ + distance * 0.6
      );
    } else {
      position = new THREE.Vector3(
        centerX + distance,
        Math.max(5, distance * 0.85),
        centerZ + distance
      );
    }

    camera.position.copy(position);
    camera.lookAt(target);
    camera.updateProjectionMatrix();

    if (controls.current) {
      controls.current.target.copy(target);
      controls.current.update();
    }
  }, [
    camera,
    view,
    resetVersion,
    centerX,
    centerZ,
    radius,
  ]);

  useEffect(() => {
    gl.domElement.style.touchAction = "none";
  }, [gl]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enableRotate
      enableZoom
      enablePan
      rotateSpeed={0.65}
      zoomSpeed={0.9}
      panSpeed={0.75}
      minDistance={1}
      maxDistance={180}
      minPolarAngle={0.05}
      maxPolarAngle={Math.PI / 2 - 0.01}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}

function ResidentialScene({
  view,
  resetVersion,
}: {
  view: CameraView;
  resetVersion: number;
}) {
  const walls = useArchitectStore(
    (state) => state.plan.walls
  );

  const openings = useArchitectStore(
    (state) => state.plan.openings
  );

  const rooms = useMemo(
    () => detectPlanarRooms(walls),
    [walls]
  );

  const bounds = walls.flatMap((wall) => [
    wall.start,
    wall.end,
  ]);

  const centerX = bounds.length
    ? (Math.min(...bounds.map((p) => p.x)) +
        Math.max(...bounds.map((p) => p.x))) / 2
    : 0;

  const centerZ = bounds.length
    ? (Math.min(...bounds.map((p) => p.y)) +
        Math.max(...bounds.map((p) => p.y))) / 2
    : 0;

  return (
    <>
      <color
        attach="background"
        args={["#e8eeea"]}
      />

      <ambientLight intensity={1.5} />

      <directionalLight
        position={[10, 18, 12]}
        intensity={2.1}
        castShadow
      />

      <CameraController
        view={view}
        resetVersion={resetVersion}
        centerX={centerX}
        centerZ={centerZ}
        radius={Math.max(
          4,
          bounds.length
            ? Math.max(
                Math.max(...bounds.map((p) => p.x)) -
                  Math.min(...bounds.map((p) => p.x)),
                Math.max(...bounds.map((p) => p.y)) -
                  Math.min(...bounds.map((p) => p.y))
              )
            : 4
        )}
      />

      <Grid
        position={[0, -0.03, 0]}
        infiniteGrid
        cellSize={1}
        sectionSize={5}
        cellColor="#b8c9bd"
        sectionColor="#719982"
        fadeDistance={100}
      />

      {rooms.map((room) => (
        <ArchitecturalFloor
          key={room.id}
          room={room}
        />
      ))}

      {walls.map((wall) => (
        <ArchitecturalWall
          key={wall.id}
          wall={wall}
          openings={openings}
        />
      ))}
    </>
  );
}

export default function Residential3D() {
  const [view, setView] = useState<CameraView>("overview");

  const walls = useArchitectStore((state) => state.plan.walls);

  const detectedRooms = useMemo(
    () => detectPlanarRooms(walls),
    [walls]
  );
  const [resetVersion, setResetVersion] = useState(0);

  function chooseView(next: CameraView) {
    setView(next);
    setResetVersion((n) => n + 1);
  }
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        position: "relative",
        touchAction: "none",
      }}
    >
      <Canvas shadows dpr={[1, 2]}>
        <ResidentialScene view={view} resetVersion={resetVersion} />
      </Canvas>

      <div className="room-debug">
        DETECTED ROOMS: {detectedRooms.length}
      </div>

      <div className="camera-controls">
        <button
          type="button"
          onClick={() => {
            chooseView("overview");
          }}
        >
          Overview
        </button>

        <button
          type="button"
          onClick={() => {
            chooseView("top");
          }}
        >
          Top
        </button>

        <button
          type="button"
          onClick={() => {
            chooseView("interior");
          }}
        >
          Interior
        </button>

        <button
          type="button"
          onClick={() => {
            setResetVersion((n) => n + 1);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
