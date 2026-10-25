import type {
  Point2D,
  Wall,
} from "../../types/architecture";

const EPSILON = 1e-8;

export type WallIntersection = {
  point: Point2D;
  wallA: string;
  wallB: string;
  parameterA: number;
  parameterB: number;
};

function cross(
  a: Point2D,
  b: Point2D
): number {
  return a.x * b.y - a.y * b.x;
}

function subtract(
  a: Point2D,
  b: Point2D
): Point2D {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

export function intersectWalls(
  first: Wall,
  second: Wall
): WallIntersection | null {
  const p = first.start;
  const q = second.start;

  const r = subtract(first.end, first.start);
  const s = subtract(second.end, second.start);

  const denominator = cross(r, s);

  // Parallel or collinear segments are handled
  // separately by a future overlap validator.
  if (Math.abs(denominator) < EPSILON) {
    return null;
  }

  const qp = subtract(q, p);

  const t = cross(qp, s) / denominator;
  const u = cross(qp, r) / denominator;

  if (
    t < -EPSILON ||
    t > 1 + EPSILON ||
    u < -EPSILON ||
    u > 1 + EPSILON
  ) {
    return null;
  }

  return {
    point: {
      x: p.x + t * r.x,
      y: p.y + t * r.y,
    },
    wallA: first.id,
    wallB: second.id,
    parameterA: Math.min(1, Math.max(0, t)),
    parameterB: Math.min(1, Math.max(0, u)),
  };
}

export function findWallIntersections(
  walls: Wall[]
): WallIntersection[] {
  const intersections: WallIntersection[] = [];

  for (let i = 0; i < walls.length; i++) {
    for (let j = i + 1; j < walls.length; j++) {
      const intersection = intersectWalls(
        walls[i],
        walls[j]
      );

      if (intersection) {
        intersections.push(intersection);
      }
    }
  }

  return intersections;
}
