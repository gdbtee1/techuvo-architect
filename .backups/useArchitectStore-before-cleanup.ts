import { create } from "zustand";

import type {
  EditorMode,
  EditorTool,
  FloorPlan,
  Opening,
  Point2D,
  Wall,
} from "../types/architecture";

interface ArchitectState {
  plan: FloorPlan;
  activeTool: EditorTool;
  editorMode: EditorMode;
  selectedWallId: string | null;
  past: FloorPlan[];
  future: FloorPlan[];
  undo: () => void;
  redo: () => void;

  setTool: (tool: EditorTool) => void;
  setEditorMode: (mode: EditorMode) => void;
  selectWall: (id: string | null) => void;

  addWall: (
    start: Point2D,
    end: Point2D
  ) => void;

  updateWall: (
    id: string,
    changes: Partial<Wall>
  ) => void;

  addOpening: (
    wallId: string,
    offset: number,
    type: Opening["type"]
  ) => boolean;

  deleteSelectedWall: () => void;
  clearSelection: () => void;
}

const timestamp = new Date().toISOString();

export const useArchitectStore =
  create<ArchitectState>((set) => ({
    plan: {
      id: crypto.randomUUID(),
      name: "Untitled Residence",
      units: "meters",
      walls: [],
      openings: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    },

    activeTool: "wall",
    editorMode: "split",
    selectedWallId: null,
    past: [],
    future: [],

    setTool: (activeTool) =>
      set({ activeTool }),

    setEditorMode: (editorMode) =>
      set({ editorMode }),

    selectWall: (selectedWallId) =>
      set({ selectedWallId }),

    clearSelection: () =>
      set({ selectedWallId: null }),

    addWall: (start, end) =>
      set((state) => {
        const length = Math.hypot(
          end.x - start.x,
          end.y - start.y
        );

        if (length < 0.1) return state;

        const wall: Wall = {
          id: crypto.randomUUID(),
          start,
          end,
          thickness: 0.15,
          height: 2.7,
        };

        return {
          past: [...state.past, state.plan].slice(-50),
          future: [],
          plan: {
            ...state.plan,
            walls: [...state.plan.walls, wall],
            updatedAt: new Date().toISOString(),
          },
        };
      }),

    addOpening: (wallId, offset, type) => {
      let created = false;

      set((state) => {
        const wall = state.plan.walls.find(
          (item) => item.id === wallId
        );

        if (!wall) return state;
        if (!Number.isFinite(offset)) return state;
        if (type !== "door" && type !== "window") return state;

        const length = Math.hypot(
          wall.end.x - wall.start.x,
          wall.end.y - wall.start.y
        );

        const width = type === "door" ? 0.9 : 1.2;
        const height = type === "door" ? 2.1 : 1.2;
        const sillHeight = type === "door" ? 0 : 0.9;

        // Offset means the distance from the wall start
        // to the CENTER of the opening, in meters.
        const clearance = 0.15;
        const start = offset - width / 2;
        const end = offset + width / 2;

        if (
          start < clearance ||
          end > length - clearance ||
          sillHeight + height > wall.height
        ) {
          return state;
        }

        const overlaps = state.plan.openings.some((item) => {
          if (item.wallId !== wallId) return false;

          const itemStart = item.offset - item.width / 2;
          const itemEnd = item.offset + item.width / 2;

          return (
            start < itemEnd + clearance &&
            end > itemStart - clearance
          );
        });

        if (overlaps) return state;

        const opening: Opening = {
          id: crypto.randomUUID(),
          wallId,
          type,
          offset,
          width,
          height,
          sillHeight,
        };

        created = true;

        return {
          past: [...state.past, state.plan].slice(-50),
          future: [],
          plan: {
            ...state.plan,
            openings: [...state.plan.openings, opening],
            updatedAt: new Date().toISOString(),
          },
        };
      });

      return created;
    },

    updateWall: (id, changes) =>
      set((state) => ({
        past: [...state.past, state.plan].slice(-50),
        future: [],
        plan: {
          ...state.plan,
          walls: state.plan.walls.map((wall) =>
            wall.id === id
              ? {
                  ...wall,
                  ...changes,
                  id: wall.id,
                }
              : wall
          ),
          updatedAt: new Date().toISOString(),
        },
      })),

    deleteSelectedWall: () =>
      set((state) => {
        if (!state.selectedWallId) return state;

        return {
        past: [...state.past, state.plan].slice(-50),
        future: [],
        plan: {
          ...state.plan,
          walls: state.plan.walls.filter(
            (wall) =>
              wall.id !== state.selectedWallId
          ),
          updatedAt: new Date().toISOString(),
        },
        selectedWallId: null,
      };
      }),

    undo: () =>
      set((state) => {
        if (!state.past.length) return state;

        const previous = state.past[state.past.length - 1];

        return {
          plan: previous,
          past: state.past.slice(0, -1),
          future: [state.plan, ...state.future].slice(0, 50),
          selectedWallId: null,
        };
      }),

    redo: () =>
      set((state) => {
        if (!state.future.length) return state;

        const next = state.future[0];

        return {
          plan: next,
          past: [...state.past, state.plan].slice(-50),
          future: state.future.slice(1),
          selectedWallId: null,
        };
      }),
  }));
