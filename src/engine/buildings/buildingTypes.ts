/**
 * TECHUVO ARCHITECT
 * Universal parametric building project schema.
 *
 * Measurements use meters internally.
 */

export type BuildingCategory =
  | "residential"
  | "agricultural"
  | "commercial"
  | "industrial-farming";

export type RoomType =
  | "bedroom"
  | "bathroom"
  | "living"
  | "kitchen"
  | "garage"
  | "office"
  | "conference"
  | "lobby"
  | "warehouse"
  | "greenhouse"
  | "storage"
  | "workshop"
  | "circulation"
  | "utility"
  | "custom";

export type OpeningType = "door" | "window";

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface BuildingComponent {
  id: string;
  assetId: string;
  name: string;
  position: Position3D;
  rotation: Position3D;
  scale: Position3D;
  metadata?: Record<string, string | number | boolean>;
}

export interface BuildingWall {
  id: string;
  start: { x: number; z: number };
  end: { x: number; z: number };
  thickness: number;
  height: number;
  materialId?: string;
}

export interface BuildingOpening {
  id: string;
  wallId: string;
  type: OpeningType;
  offset: number;
  width: number;
  height: number;
  sillHeight: number;
}

export interface BuildingRoom {
  id: string;
  name: string;
  type: RoomType;
  /**
   * Editable concept-space rectangle.
   * A later geometry engine will support polygons.
   */
  bounds: {
    x: number;
    z: number;
    width: number;
    length: number;
  };
  components: BuildingComponent[];
}

export interface BuildingFloor {
  id: string;
  name: string;
  level: number;
  elevation: number;
  height: number;
  width: number;
  length: number;
  rooms: BuildingRoom[];
  walls: BuildingWall[];
  openings: BuildingOpening[];
  components: BuildingComponent[];
}

export interface BuildingProject {
  schemaVersion: 1;
  id: string;
  name: string;
  category: BuildingCategory;
  units: "meters";
  floors: BuildingFloor[];
  createdAt: string;
  updatedAt: string;
}

export function createBuildingProject(
  category: BuildingCategory,
  floorCount: number,
  width = 12,
  length = 15,
  floorHeight = 3.2
): BuildingProject {
  if (!Number.isInteger(floorCount) ||
      floorCount < 1 ||
      floorCount > 20) {
    throw new Error("Floor count must be between 1 and 20.");
  }

  if (
    ![width, length, floorHeight].every(
      (value) => Number.isFinite(value) && value > 0
    )
  ) {
    throw new Error("Building dimensions must be positive.");
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const floors: BuildingFloor[] = Array.from(
    { length: floorCount },
    (_, index) => {
      const level = index + 1;

      return {
        id: crypto.randomUUID(),
        name:
          level === 1
            ? "Ground Floor"
            : `Floor ${level}`,
        level,
        elevation: index * floorHeight,
        height: floorHeight,
        width,
        length,
        rooms: [],
        walls: [
          {
            id: crypto.randomUUID(),
            start: { x: 0, z: 0 },
            end: { x: width, z: 0 },
            thickness: 0.2,
            height: floorHeight,
          },
          {
            id: crypto.randomUUID(),
            start: { x: width, z: 0 },
            end: { x: width, z: length },
            thickness: 0.2,
            height: floorHeight,
          },
          {
            id: crypto.randomUUID(),
            start: { x: width, z: length },
            end: { x: 0, z: length },
            thickness: 0.2,
            height: floorHeight,
          },
          {
            id: crypto.randomUUID(),
            start: { x: 0, z: length },
            end: { x: 0, z: 0 },
            thickness: 0.2,
            height: floorHeight,
          },
        ],
        openings: [],
        components: [],
      };
    }
  );

  return {
    schemaVersion: 1,
    id,
    name: `New ${category.replace("-", " ")} project`,
    category,
    units: "meters",
    floors,
    createdAt: now,
    updatedAt: now,
  };
}
