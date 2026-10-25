export type ArchitectureScene = "estate" | "barn" | "farm";

export const architectureAssets: Record<
  ArchitectureScene,
  {
    title: string;
    modelUrl: string;
    targetSize: number;
  }
> = {
  estate: {
    title: "Luxury Estate",
    modelUrl: "/models/architecture/luxury-estate.glb",
    targetSize: 8,
  },
  barn: {
    title: "Agricultural Architecture",
    modelUrl: "/models/architecture/agricultural-barn.glb",
    targetSize: 8,
  },
  farm: {
    title: "Vertical Farming",
    modelUrl: "/models/architecture/vertical-farm.glb",
    targetSize: 8,
  },
};
