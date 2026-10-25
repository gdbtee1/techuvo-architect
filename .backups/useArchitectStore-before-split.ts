import { create } from "zustand";

import type {
  EditorMode,
  EditorTool,
  FloorPlan,
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
    editorMode: "2d",
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
