import {
  House,
  Scan,
  ArrowUpFromLine,
  Layers3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

export type BarnView = "overview" | "front" | "side" | "top" | "dollhouse";

type Props = {
  activeView: BarnView;
  onViewChange: (view: BarnView) => void;
  onZoom: (direction: "in" | "out") => void;
};

export default function BarnViewToolbar({
  activeView,
  onViewChange,
  onZoom,
}: Props) {
  const views = [
    { id: "overview", label: "3D", icon: House },
    { id: "front", label: "Front", icon: Scan },
    { id: "side", label: "Side", icon: Scan },
    { id: "top", label: "Top", icon: ArrowUpFromLine },
    { id: "dollhouse", label: "Inside", icon: Layers3 },
  ] as const;

  return (
    <div
      className="barn-view-toolbar"
      aria-label="Building camera controls"
    >
      <div className="barn-view-toolbar-group">
        {views.map((view) => {
          const Icon = view.icon;

          return (
            <button
              key={view.id}
              type="button"
              className={
                activeView === view.id ? "active" : ""
              }
              onClick={() => onViewChange(view.id)}
              aria-pressed={activeView === view.id}
            >
              <Icon size={17} />
              <span>{view.label}</span>
            </button>
          );
        })}
      </div>

      <div className="barn-view-toolbar-divider" />

      <div className="barn-view-toolbar-group">
        <button
          type="button"
          onClick={() => onZoom("in")}
          aria-label="Zoom in"
        >
          <ZoomIn size={18} />
        </button>

        <button
          type="button"
          onClick={() => onZoom("out")}
          aria-label="Zoom out"
        >
          <ZoomOut size={18} />
        </button>

        <button
          type="button"
          onClick={() => onViewChange("overview")}
          aria-label="Reset view"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}
