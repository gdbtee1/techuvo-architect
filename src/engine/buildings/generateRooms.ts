import type {
  BuildingCategory,
  BuildingFloor,
  BuildingProject,
  RoomType,
} from "./buildingTypes";

type RoomPreset = {
  name: string;
  type: RoomType;
};

const layouts: Record<
  BuildingCategory,
  (level: number) => RoomPreset[]
> = {
  residential: (level) =>
    level === 1
      ? [
          { name: "Living Room", type: "living" },
          { name: "Kitchen", type: "kitchen" },
          { name: "Bathroom", type: "bathroom" },
          { name: "Bedroom", type: "bedroom" },
        ]
      : [
          { name: "Primary Bedroom", type: "bedroom" },
          { name: "Bedroom", type: "bedroom" },
          { name: "Bathroom", type: "bathroom" },
          { name: "Living Area", type: "living" },
        ],

  agricultural: () => [
    { name: "Equipment Storage", type: "storage" },
    { name: "Workshop", type: "workshop" },
    { name: "Growing Area", type: "greenhouse" },
    { name: "Utility Room", type: "utility" },
  ],

  commercial: (level) =>
    level === 1
      ? [
          { name: "Reception", type: "lobby" },
          { name: "Office", type: "office" },
          { name: "Conference", type: "conference" },
          { name: "Utilities", type: "utility" },
        ]
      : [
          { name: "Open Office", type: "office" },
          { name: "Meeting Room", type: "conference" },
          { name: "Private Office", type: "office" },
          { name: "Shared Workspace", type: "office" },
        ],

  "industrial-farming": () => [
    { name: "Production Area", type: "greenhouse" },
    { name: "Processing", type: "workshop" },
    { name: "Cold Storage", type: "storage" },
    { name: "Equipment Room", type: "utility" },
  ],
};

function generateFloorRooms(
  floor: BuildingFloor,
  category: BuildingCategory
): BuildingFloor {
  const presets = layouts[category](floor.level);

  // Four conceptual zones with a shared central circulation band.
  // Future planner will replace these with constraint-based layouts.
  const margin = 0.35;
  const corridor = 1.8;

  const usableWidth = floor.width - 2 * margin;
  const roomWidth = (usableWidth - corridor) / 2;
  const roomLength = (floor.length - 2 * margin) / 2;

  const xs = [
    margin,
    margin + roomWidth + corridor,
  ];

  const zs = [
    margin,
    margin + roomLength,
  ];

  const rooms = presets.map((preset, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);

    return {
      id: crypto.randomUUID(),
      name: preset.name,
      type: preset.type,
      bounds: {
        x: xs[column],
        z: zs[row],
        width: roomWidth,
        length: roomLength,
      },
      components: [],
    };
  });

  return { ...floor, rooms };
}

export function generateRoomLayouts(
  project: BuildingProject
): BuildingProject {
  return {
    ...project,
    floors: project.floors.map((floor) =>
      generateFloorRooms(floor, project.category)
    ),
  };
}
