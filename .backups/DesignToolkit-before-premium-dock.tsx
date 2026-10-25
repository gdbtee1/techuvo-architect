import {
  Ruler,
  House,
  DoorOpen,
  Palette,
  Footprints,
} from "lucide-react";

export type ToolkitTab =
  | "dimensions"
  | "roof"
  | "openings"
  | "materials"
  | "explore";

type Props = {
  active: ToolkitTab;
  onChange: (tab: ToolkitTab) => void;
};

const tools = [
  { id: "dimensions", label: "Dimensions", Icon: Ruler },
  { id: "roof", label: "Roof", Icon: House },
  { id: "openings", label: "Doors & Windows", Icon: DoorOpen },
  { id: "materials", label: "Materials", Icon: Palette },
  { id: "explore", label: "Explore", Icon: Footprints },
] as const;

export default function DesignToolkit({
  active,
  onChange,
}: Props) {
  return (
    <nav className="design-toolkit" aria-label="Design tools">
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
          <Icon size={19} strokeWidth={1.8} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
