import {
  FolderOpen,
  SlidersHorizontal,
  PencilRuler,
  Scale,
  Move,
  RotateCw,
  Image as ImageIcon,
  Monitor,
  RefreshCw,
  Box,
  SunMedium,
  LampDesk,
  Camera,
  ScanLine,
  Shield,
  AreaChart,
  Mountain,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type RibbonItem = {
  label: string;
  icon: LucideIcon;
};

type RibbonGroup = {
  title: string;
  items: RibbonItem[];
};

const topTabs = [
  "FILE",
  "PROJECT",
  "CONSTRUCTION",
  "3D",
  "TERRAIN",
  "2D VIEWS",
  "EDIT",
];

const groups: RibbonGroup[] = [
  {
    title: "Project",
    items: [
      { label: "Acquire", icon: FolderOpen },
      { label: "Options", icon: SlidersHorizontal },
      { label: "Edit", icon: PencilRuler },
      { label: "Scale", icon: Scale },
    ],
  },
  {
    title: "Modify",
    items: [
      { label: "Move", icon: Move },
      { label: "Rotate", icon: RotateCw },
      { label: "Background", icon: ImageIcon },
      { label: "Display", icon: Monitor },
    ],
  },
  {
    title: "Scene",
    items: [
      { label: "Update", icon: RefreshCw },
      { label: "Object", icon: Box },
      { label: "Light", icon: SunMedium },
      { label: "Lamp", icon: LampDesk },
    ],
  },
  {
    title: "Views",
    items: [
      { label: "Camera", icon: Camera },
      { label: "Section", icon: ScanLine },
      { label: "Collision", icon: Shield },
      { label: "Area", icon: AreaChart },
    ],
  },
  {
    title: "Output",
    items: [
      { label: "Terrain", icon: Mountain },
      { label: "Video", icon: Video },
    ],
  },
];

export default function CadRibbon() {
  return (
    <div className="cad-ribbon-shell">
      <div className="cad-ribbon-tabs">
        {topTabs.map((tab, index) => (
          <button
            key={tab}
            className={
              "cad-ribbon-tab " + (index === 1 ? "cad-ribbon-tab-active" : "")
            }
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="cad-ribbon-body">
        {groups.map((group) => (
          <div className="cad-ribbon-group" key={group.title}>
            <div className="cad-ribbon-tools">
              {group.items.map(({ label, icon: Icon }) => (
                <button key={label} className="cad-ribbon-tool" type="button">
                  <Icon size={17} strokeWidth={1.8} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="cad-ribbon-group-title">{group.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
