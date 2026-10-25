import { useCadKeyboard } from "../../hooks/useCadKeyboard";
import Residential3D from "../viewport/Residential3D";
import CadCanvas from "../editor/CadCanvas";
import CadRibbon from "./CadRibbon";
import { useState } from "react";
import {
  ArrowLeft,
  Box,
  ChevronDown,
  Grid2X2,
  Layers3,
  Menu,
  MousePointer2,
  Move,
  Ruler,
  Save,
  Settings2,
  SquarePen,
  Undo2,
  Redo2,
  X,
} from "lucide-react";

import {
  useArchitectStore,
} from "../../store/useArchitectStore";

import type {
  EditorTool,
  EditorMode,
} from "../../types/architecture";

const tools: {
  id: EditorTool;
  label: string;
  icon: typeof MousePointer2;
}[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "wall", label: "Draw wall", icon: SquarePen },
  { id: "pan", label: "Move canvas", icon: Move },
  { id: "measure", label: "Measure", icon: Ruler },
];

export default function ArchitectWorkspace() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [propertiesOpen, setPropertiesOpen] =
    useState(false);

  useCadKeyboard();

  const undo = useArchitectStore((s) => s.undo);
  const redo = useArchitectStore((s) => s.redo);
  const canUndo = useArchitectStore((s) => s.past.length > 0);
  const canRedo = useArchitectStore((s) => s.future.length > 0);

  const plan = useArchitectStore((s) => s.plan);
  const activeTool = useArchitectStore((s) => s.activeTool);
  const setTool = useArchitectStore((s) => s.setTool);
  const editorMode = useArchitectStore((s) => s.editorMode);
  const setEditorMode = useArchitectStore(
    (s) => s.setEditorMode
  );

  const modes: EditorMode[] = ["2d", "3d", "split"];

  return (
    <div className="architect-app">
      <header className="architect-header">
        <div className="brand-area">
          <button
            className="icon-button back-button"
            aria-label="Back"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={19} />
          </button>

          <div className="brand-mark">A</div>

          <div className="project-identity">
            <strong>ARCHITECT STUDIO</strong>
            <span>{plan.name}</span>
          </div>
        </div>

        <div className="header-center">
          <span className="project-indicator" />
          <span>Residential Workspace</span>
          <ChevronDown size={14} />
        </div>

        <div className="header-actions">
          <span className="save-status">
            Local prototype
          </span>

          <button
            className="header-save"
            onClick={() => {
              const blob = new Blob(
                [JSON.stringify(plan, null, 2)],
                { type: "application/json" }
              );

              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");

              anchor.href = url;
              anchor.download = "residential-plan.json";
              anchor.click();

              URL.revokeObjectURL(url);
            }}
          >
            <Save size={16} />
            <span>Export JSON</span>
          </button>

          <button
            className="icon-button mobile-menu-trigger"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={21} />
          </button>
        </div>
      </header>

      <div className="architect-body">
        <aside className="desktop-toolbar">
          <div className="toolbar-caption">DESIGN</div>

          {tools.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              title={label}
              aria-label={label}
              aria-pressed={activeTool === id}
              className={
                "tool-button " +
                (activeTool === id ? "active" : "")
              }
              onClick={() => setTool(id)}
            >
              <Icon size={21} strokeWidth={1.8} />
            </button>
          ))}

          <div className="toolbar-divider" />

          <button
            className="tool-button"
            title="Layers"
            onClick={() => setPropertiesOpen(true)}
          >
            <Layers3 size={21} />
          </button>

          <button
            className="tool-button"
            title="Project settings"
            onClick={() => setPropertiesOpen(true)}
          >
            <Settings2 size={21} />
          </button>
        </aside>

        <main className="design-main">
          <CadRibbon />

          <div className="workspace-topbar">
            <div className="breadcrumb">
              PROJECT / RESIDENTIAL / LEVEL 01
            </div>

            <div className="view-switcher">
              {modes.map((mode) => (
                <button
                  key={mode}
                  className={
                    editorMode === mode ? "selected" : ""
                  }
                  onClick={() => setEditorMode(mode)}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="history-controls">
              <button
                title="Undo"
                onClick={undo}
                disabled={!canUndo}
              >
                <Undo2 size={17} />
              </button>
              <button
                title="Redo"
                onClick={redo}
                disabled={!canRedo}
              >
                <Redo2 size={17} />
              </button>
            </div>
          </div>

          <div className="drawing-surface">
            <div className="canvas-top-label">
              <Grid2X2 size={15} />
              <span>LEVEL 01 — FLOOR PLAN</span>
            </div>

            
            <div
              key={editorMode}
              className={
                editorMode === "split"
                  ? "architect-view architect-view-split"
                  : "architect-view"
              }
            >
              {(editorMode === "2d" ||
                editorMode === "split") && (
                <div className="architect-view-pane">
                  <CadCanvas />
                </div>
              )}

              {(editorMode === "3d" ||
                editorMode === "split") && (
                <div className="architect-view-pane">
                  <Residential3D />
                </div>
              )}
            </div>


            <div className="canvas-scale">
              <span className="scale-line" />
              <span>1m reference</span>
            </div>
          </div>

          <div className="workspace-status">
            <span>
              <span className="status-dot" />
              READY
            </span>

            <span>{plan.walls.length} WALLS</span>
            <span>METRIC (m)</span>
            <span>CONCEPT DESIGN</span>
          </div>
        </main>

        <aside
          className={
            "properties-panel " +
            (propertiesOpen ? "mobile-visible" : "")
          }
        >
          <div className="properties-heading">
            <div>
              <span className="eyebrow">INSPECTOR</span>
              <h2>Properties</h2>
            </div>

            <button
              className="properties-close"
              aria-label="Close properties"
              onClick={() => setPropertiesOpen(false)}
            >
              <X size={19} />
            </button>
          </div>

          <div className="property-section">
            <span className="property-label">PROJECT</span>
            <strong>{plan.name}</strong>
            <span className="property-muted">
              Residential design
            </span>
          </div>

          <div className="property-section">
            <span className="property-label">
              GEOMETRY
            </span>

            <div className="property-row">
              <span>Walls</span>
              <strong>{plan.walls.length}</strong>
            </div>

            <div className="property-row">
              <span>Units</span>
              <strong>Meters</strong>
            </div>

            <div className="property-row">
              <span>Default wall height</span>
              <strong>2.70 m</strong>
            </div>

            <div className="property-row">
              <span>Default thickness</span>
              <strong>0.15 m</strong>
            </div>
          </div>

          <div className="inspector-note">
            <Layers3 size={18} />
            <p>
              Select an architectural element to
              inspect its dimensions and properties.
            </p>
          </div>
        </aside>
      </div>

      <div className="mobile-history">
        <button onClick={undo} disabled={!canUndo}>
          <Undo2 size={17} /> Undo
        </button>
        <button onClick={redo} disabled={!canRedo}>
          <Redo2 size={17} /> Redo
        </button>
      </div>

      <nav className="mobile-tool-nav" aria-label="Drawing tools">
        {tools.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={activeTool === id ? "active" : ""}
            aria-pressed={activeTool === id}
            onClick={() => setTool(id)}
          >
            <Icon size={21} />
            <span>{label}</span>
          </button>
        ))}

        <button onClick={() => setPropertiesOpen(true)}>
          <Settings2 size={21} />
          <span>Details</span>
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-header">
            <strong>ARCHITECT STUDIO</strong>
            <button
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X />
            </button>
          </div>

          <p>{plan.name}</p>

          <button
            onClick={() => {
              setPropertiesOpen(true);
              setMobileMenuOpen(false);
            }}
          >
            <Settings2 size={18} />
            Project properties
          </button>

          <button
            onClick={() => {
              setEditorMode("3d");
              setMobileMenuOpen(false);
            }}
          >
            <Box size={18} />
            3D workspace
          </button>
        </div>
      )}
    </div>
  );
}
