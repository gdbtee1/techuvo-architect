export type Point2D = {
  x: number;
  y: number;
};

export type Wall = {
  id: string;
  start: Point2D;
  end: Point2D;
  thickness: number;
  height: number;
};

export type Opening = {
  id: string;
  wallId: string;
  type: "door" | "window";
  offset: number;
  width: number;
  height: number;
  sillHeight: number;
};

export type FloorPlan = {
  id: string;
  name: string;
  units: "meters";
  walls: Wall[];
  openings: Opening[];
  createdAt: string;
  updatedAt: string;
};

export type EditorTool =
  | "select"
  | "wall"
  | "door"
  | "window"
  | "pan"
  | "measure";

export type EditorMode =
  | "2d"
  | "3d"
  | "split";
