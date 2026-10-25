import type {
  Point2D,
  Wall,
} from "../../types/architecture";

import {
  intersectWalls,
} from "./intersections";

export type PlanarRoom = {
  id: string;
  points: Point2D[];
  area: number;
};

type Edge = {
  from: number;
  to: number;
  angle: number;
  twin: number;
};

const EPS = 1e-6;

function distance(a: Point2D, b: Point2D) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function polygonArea(points: Point2D[]) {
  let area = 0;

  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }

  return area / 2;
}

export function detectPlanarRooms(
  walls: Wall[]
): PlanarRoom[] {
  const vertices: Point2D[] = [];

  function vertexId(point: Point2D) {
    let id = vertices.findIndex(
      (p) => distance(p, point) < EPS
    );

    if (id === -1) {
      id = vertices.length;
      vertices.push({ ...point });
    }

    return id;
  }

  const splits = walls.map(() => [0, 1]);

  for (let i = 0; i < walls.length; i++) {
    for (let j = i + 1; j < walls.length; j++) {
      const hit = intersectWalls(walls[i], walls[j]);

      if (!hit) continue;

      splits[i].push(hit.parameterA);
      splits[j].push(hit.parameterB);
    }
  }

  const edges: Edge[] = [];
  const adjacency = new Map<number, number[]>();
  const segments = new Set<string>();

  function addEdge(a: number, b: number) {
    if (a === b) return;

    const segmentKey =
      Math.min(a, b) + ":" + Math.max(a, b);

    if (segments.has(segmentKey)) return;
    segments.add(segmentKey);

    const p = vertices[a];
    const q = vertices[b];

    const forward = edges.length;
    const reverse = forward + 1;

    edges.push({
      from: a,
      to: b,
      angle: Math.atan2(q.y - p.y, q.x - p.x),
      twin: reverse,
    });

    edges.push({
      from: b,
      to: a,
      angle: Math.atan2(p.y - q.y, p.x - q.x),
      twin: forward,
    });

    adjacency.set(a, [...(adjacency.get(a) ?? []), forward]);
    adjacency.set(b, [...(adjacency.get(b) ?? []), reverse]);
  }

  walls.forEach((wall, index) => {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;

    const parameters = [...splits[index]]
      .map((t) => Math.max(0, Math.min(1, t)))
      .sort((a, b) => a - b)
      .filter((t, i, arr) =>
        i === 0 || Math.abs(t - arr[i - 1]) > EPS
      );

    for (let i = 0; i < parameters.length - 1; i++) {
      const t1 = parameters[i];
      const t2 = parameters[i + 1];

      const a = vertexId({
        x: wall.start.x + dx * t1,
        y: wall.start.y + dy * t1,
      });

      const b = vertexId({
        x: wall.start.x + dx * t2,
        y: wall.start.y + dy * t2,
      });

      addEdge(a, b);
    }
  });

  for (const connected of adjacency.values()) {
    connected.sort(
      (a, b) => edges[a].angle - edges[b].angle
    );
  }

  const visited = new Set<number>();
  const rooms: PlanarRoom[] = [];

  for (let start = 0; start < edges.length; start++) {
    if (visited.has(start)) continue;

    const polygon: Point2D[] = [];
    const traversed: number[] = [];
    let current = start;
    let closed = false;

    for (let step = 0; step <= edges.length; step++) {
      if (traversed.includes(current)) break;

      traversed.push(current);
      polygon.push(vertices[edges[current].from]);

      const edge = edges[current];
      const outgoing = adjacency.get(edge.to) ?? [];
      const twinIndex = outgoing.indexOf(edge.twin);

      if (twinIndex < 0 || outgoing.length === 0) break;

      current = outgoing[
        (twinIndex - 1 + outgoing.length) %
        outgoing.length
      ];

      if (current === start) {
        closed = true;
        break;
      }
    }

    traversed.forEach((id) => visited.add(id));

    if (!closed || polygon.length < 3) continue;

    const area = polygonArea(polygon);

    // Reject exterior face and degenerate polygons.
    if (area <= 0.01) continue;

    rooms.push({
      id: `room-${rooms.length + 1}`,
      points: polygon,
      area,
    });
  }

  return rooms;
}
