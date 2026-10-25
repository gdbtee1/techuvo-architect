import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Stage,
  Layer,
  Line,
  Circle,
  Text,
} from "react-konva";

import type Konva from "konva";
import OpeningSymbol from "./OpeningSymbol";

import { useArchitectStore } from "../../store/useArchitectStore";
import {
  snapToWallEndpoint,
  snapToGrid,
} from "../../engine/geometry/wallGeometry";
import type { Point2D } from "../../types/architecture";

const BASE_SCALE = 50;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const GRID = 0.25;

function wallLength(
  a: Point2D,
  b: Point2D
) {
  return Math.hypot(
    b.x - a.x,
    b.y - a.y
  );
}

export default function CadCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({
    width: 800,
    height: 600,
  });

  const [origin, setOrigin] = useState<Point2D>({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);

  const gestureRef = useRef<{
    distance: number;
    center: Point2D;
  } | null>(null);

  const panRef = useRef<Point2D | null>(null);

  function updateZoom(next: number) {
    const clamped = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, next)
    );

    zoomRef.current = clamped;
    setZoom(clamped);
  }

  const [startPoint, setStartPoint] =
    useState<Point2D | null>(null);

  const [cursor, setCursor] =
    useState<Point2D | null>(null);

  const plan = useArchitectStore((s) => s.plan);
  const activeTool = useArchitectStore((s) => s.activeTool);
  const addWall = useArchitectStore((s) => s.addWall);
  const addOpening = useArchitectStore((s) => s.addOpening);
  const selectWall = useArchitectStore((s) => s.selectWall);
  const deleteSelectedWall = useArchitectStore(
    (s) => s.deleteSelectedWall
  );
  const selectedWallId = useArchitectStore(
    (s) => s.selectedWallId
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;

      setSize({
        width: rect.width,
        height: rect.height,
      });
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const SCALE = BASE_SCALE * zoom;

  // Display all geometry using meters internally.
  // The screen origin begins in the canvas center.
  function toScreen(point: Point2D) {
    return {
      x: size.width / 2 + origin.x + point.x * SCALE,
      y: size.height / 2 + origin.y + point.y * SCALE,
    };
  }

  function toWorld(point: Point2D): Point2D {
    const rawPoint = {
      x: (point.x - size.width / 2 - origin.x) / SCALE,
      y: (point.y - size.height / 2 - origin.y) / SCALE,
    };

    if (activeTool === "wall") {
      return snapToWallEndpoint(rawPoint, plan.walls);
    }

    return snapToGrid(rawPoint);
  }

  function getWorldPointer(
    stage: Konva.Stage
  ): Point2D | null {
    const position = stage.getPointerPosition();

    if (!position) return null;

    return toWorld(position);
  }

  function handlePointerMove(
    stage: Konva.Stage
  ) {
    const point = getWorldPointer(stage);

    if (!point) return;

    setCursor(point);
  }

  function handleCanvasTap(
    stage: Konva.Stage
  ) {
    if (activeTool !== "wall") return;

    const point = getWorldPointer(stage);

    if (!point) return;

    if (!startPoint) {
      setStartPoint(point);
      return;
    }

    if (wallLength(startPoint, point) < 0.1) {
      return;
    }

    addWall(startPoint, point);

    // Continue drawing from the last endpoint.
    setStartPoint(point);
  }

  function handleOpeningPlacement(
    wallId: string,
    stage: Konva.Stage
  ) {
    if (activeTool !== "door" && activeTool !== "window") {
      return;
    }

    const wall = plan.walls.find((item) => item.id === wallId);
    const pointer = stage.getPointerPosition();

    if (!wall || !pointer) return;

    // Convert pointer to unsnapped world coordinates.
    const world = {
      x: (pointer.x - size.width / 2 - origin.x) / SCALE,
      y: (pointer.y - size.height / 2 - origin.y) / SCALE,
    };

    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const length = Math.hypot(dx, dy);

    if (length < 0.001) return;

    // Distance from the start of the wall to the
    // pointer projection along its direction.
    const offset =
      ((world.x - wall.start.x) * dx +
        (world.y - wall.start.y) * dy) / length;

    const created = addOpening(wallId, offset, activeTool);

    if (!created) {
      console.info(
        "Opening not placed: insufficient clearance or overlap."
      );
    }
  }

  const gridLines = [];

  const step = SCALE * GRID;

  for (
    let x = (size.width / 2 + origin.x) % step;
    x < size.width;
    x += step
  ) {
    gridLines.push(
      <Line
        key={`gx-${x}`}
        points={[x, 0, x, size.height]}
        stroke="#dce7df"
        strokeWidth={0.5}
        listening={false}
      />
    );
  }

  for (
    let y = (size.height / 2 + origin.y) % step;
    y < size.height;
    y += step
  ) {
    gridLines.push(
      <Line
        key={`gy-${y}`}
        points={[0, y, size.width, y]}
        stroke="#dce7df"
        strokeWidth={0.5}
        listening={false}
      />
    );
  }

  const previewEnd =
    startPoint && cursor
      ? toScreen(cursor)
      : null;

  const previewStart = startPoint
    ? toScreen(startPoint)
    : null;


  function handleWheel(event: Konva.KonvaEventObject<WheelEvent>) {
    event.evt.preventDefault();

    const stage = event.target.getStage();
    const pointer = stage?.getPointerPosition();

    if (!pointer) return;

    const oldScale = BASE_SCALE * zoomRef.current;
    const worldX =
      (pointer.x - size.width / 2 - origin.x) / oldScale;
    const worldY =
      (pointer.y - size.height / 2 - origin.y) / oldScale;

    const factor = event.evt.deltaY > 0 ? 0.9 : 1.1;
    const nextZoom = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, zoomRef.current * factor)
    );

    const nextScale = BASE_SCALE * nextZoom;

    setOrigin({
      x: pointer.x - size.width / 2 - worldX * nextScale,
      y: pointer.y - size.height / 2 - worldY * nextScale,
    });

    updateZoom(nextZoom);
  }

  function handleTouchMove(
    event: Konva.KonvaEventObject<TouchEvent>
  ) {
    const touches = event.evt.touches;

    if (touches.length !== 2) {
      if (touches.length === 1 && !gestureRef.current) {
        handlePointerMove(event.target.getStage()!);
      }
      return;
    }

    event.evt.preventDefault();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const a = touches[0];
    const b = touches[1];

    const center = {
      x: (a.clientX + b.clientX) / 2 - rect.left,
      y: (a.clientY + b.clientY) / 2 - rect.top,
    };

    const distance = Math.hypot(
      a.clientX - b.clientX,
      a.clientY - b.clientY
    );

    const previous = gestureRef.current;

    if (previous) {
      const oldScale = BASE_SCALE * zoomRef.current;
      const worldX =
        (previous.center.x - size.width / 2 - origin.x) /
        oldScale;
      const worldY =
        (previous.center.y - size.height / 2 - origin.y) /
        oldScale;

      const nextZoom = Math.max(
        MIN_ZOOM,
        Math.min(
          MAX_ZOOM,
          zoomRef.current * (distance / previous.distance)
        )
      );

      const nextScale = BASE_SCALE * nextZoom;

      setOrigin({
        x: center.x - size.width / 2 - worldX * nextScale,
        y: center.y - size.height / 2 - worldY * nextScale,
      });

      updateZoom(nextZoom);
    }

    gestureRef.current = { distance, center };
  }

  function handlePanStart(
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) {
    if (activeTool !== "pan") return;

    const pointer = event.target.getStage()?.getPointerPosition();
    if (pointer) panRef.current = pointer;
  }

  function handlePanMove(stage: Konva.Stage) {
    if (activeTool !== "pan" || !panRef.current) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const previous = panRef.current;

    setOrigin((current) => ({
      x: current.x + pointer.x - previous.x,
      y: current.y + pointer.y - previous.y,
    }));

    panRef.current = pointer;
  }

  function handlePanEnd() {
    panRef.current = null;
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        touchAction: "none",
        background: "#fbfcfa",
      }}
    >
      <Stage
        width={size.width}
        height={size.height}
        onWheel={handleWheel}
        onMouseDown={handlePanStart}
        onTouchStart={handlePanStart}
        onMouseUp={handlePanEnd}
        onTouchEnd={(event) => {
          if (event.evt.touches.length < 2) {
            gestureRef.current = null;
          }
          handlePanEnd();
        }}
        onMouseMove={(event) => {
          const stage = event.target.getStage()!;
          handlePointerMove(stage);
          handlePanMove(stage);
        }}
        onTouchMove={handleTouchMove}
        onClick={(event) => {
          if (activeTool === "select") {
            selectWall(null);
          } else {
            handleCanvasTap(event.target.getStage()!);
          }
        }}
        onTap={(event) => {
          if (activeTool === "select") {
            selectWall(null);
          } else {
            handleCanvasTap(event.target.getStage()!);
          }
        }}
      >
        <Layer listening={false}>
          {gridLines}
        </Layer>

        <Layer>
          {plan.walls.map((wall) => {
            const a = toScreen(wall.start);
            const b = toScreen(wall.end);
            return (
              <Line
                key={wall.id}
                points={[a.x, a.y, b.x, b.y]}
                stroke={
                  selectedWallId === wall.id
                    ? "#d97706"
                    : "#164f41"
                }
                strokeWidth={Math.max(
                  3,
                  wall.thickness * SCALE
                )}
                lineCap="square"
                hitStrokeWidth={24}
                onClick={(event) => {
                  if (activeTool === "select") {
                    selectWall(wall.id);
                    event.cancelBubble = true;
                  } else if (
                    activeTool === "door" ||
                    activeTool === "window"
                  ) {
                    handleOpeningPlacement(
                      wall.id,
                      event.target.getStage()!
                    );
                    event.cancelBubble = true;
                  }
                }}
                onTap={(event) => {
                  if (activeTool === "select") {
                    selectWall(wall.id);
                    event.cancelBubble = true;
                  } else if (
                    activeTool === "door" ||
                    activeTool === "window"
                  ) {
                    handleOpeningPlacement(
                      wall.id,
                      event.target.getStage()!
                    );
                    event.cancelBubble = true;
                  }
                }}
              />
            );
          })}
        </Layer>

        <Layer listening={false}>
          {plan.openings.map((opening) => {
            const wall = plan.walls.find(
              (item) => item.id === opening.wallId
            );

            if (!wall) return null;

            const dx = wall.end.x - wall.start.x;
            const dy = wall.end.y - wall.start.y;
            const length = Math.hypot(dx, dy);

            if (length < 0.001) return null;

            const center = toScreen({
              x: wall.start.x +
                (dx / length) * opening.offset,
              y: wall.start.y +
                (dy / length) * opening.offset,
            });

            return (
              <OpeningSymbol
                key={opening.id}
                opening={opening}
                wall={wall}
                scale={SCALE}
                centerX={center.x}
                centerY={center.y}
              />
            );
          })}
        </Layer>

        <Layer listening={false}>
          {plan.walls.map((wall) => {
            const a = toScreen(wall.start);
            const b = toScreen(wall.end);

            return (
              <Text
                key={`label-${wall.id}`}
                x={(a.x + b.x) / 2 - 25}
                y={(a.y + b.y) / 2 - 20}
                text={`${wallLength(
                  wall.start,
                  wall.end
                ).toFixed(2)} m`}
                fontSize={12}
                fontFamily="Arial"
                fill="#446c5c"
              />
            );
          })}

          {previewStart && previewEnd && (
            <>
              <Line
                points={[
                  previewStart.x,
                  previewStart.y,
                  previewEnd.x,
                  previewEnd.y,
                ]}
                stroke="#0d9488"
                strokeWidth={3}
                dash={[8, 5]}
              />

              <Circle
                x={previewStart.x}
                y={previewStart.y}
                radius={5}
                fill="#0d9488"
              />

              <Text
                x={
                  (previewStart.x + previewEnd.x) / 2
                }
                y={
                  (previewStart.y + previewEnd.y) / 2 -
                  22
                }
                text={`${wallLength(
                  startPoint!,
                  cursor!
                ).toFixed(2)} m`}
                fontSize={13}
                fontStyle="bold"
                fill="#0d9488"
              />
            </>
          )}
        </Layer>
      </Stage>

      <div className="cad-zoom-indicator">
        {Math.round(zoom * 100)}%
      </div>

      <div className="cad-canvas-actions">
        {selectedWallId && (
          <button
            type="button"
            className="cad-delete-button"
            onClick={deleteSelectedWall}
          >
            Delete selected wall
          </button>
        )}

        <button
          onClick={() => {
            setStartPoint(null);
            setCursor(null);
          }}
        >
          Cancel wall
        </button>

        <button
          onClick={() =>
            setOrigin({ x: 0, y: 0 })
          }
        >
          Center view
        </button>
      </div>
    </div>
  );
}
