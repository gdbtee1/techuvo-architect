import type {
  Point2D,
  Wall,
} from "../../types/architecture";

export const GRID_SIZE = 0.25;
export const SNAP_DISTANCE = 0.3;

export function distance(
  a: Point2D,
  b: Point2D
): number {
  return Math.hypot(
    b.x - a.x,
    b.y - a.y
  );
}

export function snapToGrid(
  point: Point2D
): Point2D {
  return {
    x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(point.y / GRID_SIZE) * GRID_SIZE,
  };
}

export function closestPointOnSegment(
  point: Point2D,
  start: Point2D,
  end: Point2D
): Point2D {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared < 1e-10) {
    return { ...start };
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      (
        (point.x - start.x) * dx +
        (point.y - start.y) * dy
      ) / lengthSquared
    )
  );

  return {
    x: start.x + t * dx,
    y: start.y + t * dy,
  };
}

export function snapToWallEndpoint(
  point: Point2D,
  walls: Wall[],
  threshold = SNAP_DISTANCE
): Point2D {
  let closest: Point2D | null = null;
  let smallestDistance = threshold;

  // Prioritize existing endpoints.
  for (const wall of walls) {
    for (const endpoint of [wall.start, wall.end]) {
      const d = distance(point, endpoint);

      if (d <= smallestDistance) {
        closest = endpoint;
        smallestDistance = d;
      }
    }
  }

  if (closest) {
    return { ...closest };
  }

  // Otherwise, snap to the nearest wall segment.
  for (const wall of walls) {
    const projected = closestPointOnSegment(
      point,
      wall.start,
      wall.end
    );

    const d = distance(point, projected);

    if (d <= smallestDistance) {
      closest = projected;
      smallestDistance = d;
    }
  }

  return closest
    ? { ...closest }
    : snapToGrid(point);
}

export function wallLength(wall: Wall): number {
  return distance(wall.start, wall.end);
}

export function wallAngle(wall: Wall): number {
  return Math.atan2(
    wall.end.y - wall.start.y,
    wall.end.x - wall.start.x
  );
}

export function isWallValid(
  start: Point2D,
  end: Point2D
): boolean {
  return (
    Number.isFinite(start.x) &&
    Number.isFinite(start.y) &&
    Number.isFinite(end.x) &&
    Number.isFinite(end.y) &&
    distance(start, end) >= 0.1
  );
}
