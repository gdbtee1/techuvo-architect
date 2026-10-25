import {
  Ruler,
  House,
  DoorOpen,
  Palette,
  Footprints,
  Boxes,
} from "lucide-react";

export type ToolkitTab =
  | "dimensions"
  | "roof"
  | "openings"
  | "materials"
  | "explore"
  | "components";

type Props = {
  active: ToolkitTab;
  onChange: (tab: ToolkitTab) => void;
};

const tools = [
  { id: "dimensions", label: "Dimensions", Icon: Ruler },
  { id: "roof", label: "Roof", Icon: House },
  { id: "openings", label: "Openings", Icon: DoorOpen },
  { id: "materials", label: "Materials", Icon: Palette },
  { id: "components", label: "Components", Icon: Boxes },
  { id: "explore", label: "Explore", Icon: Footprints },
] as const;

export default function DesignToolkit({
  active,
  onChange,
}: Props) {
  return (
    <div className="architect-dock-wrap">
      <nav
        className="design-toolkit architect-dock"
        aria-label="Architectural design tools"
      >
        {tools.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`design-toolkit-item ${
              active === id ? "active" : ""
            }`}
            aria-pressed={active === id}
            onClick={() => onChange(id)}
          >
            <span className="architect-dock-icon">
              <Icon size={18} strokeWidth={1.75} />
            </span>
            <span className="architect-dock-label">
              {label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
