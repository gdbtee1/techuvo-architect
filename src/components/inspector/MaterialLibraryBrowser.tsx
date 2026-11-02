import { useMemo, useState } from "react";
import installedMaterials from "../../data/techuvoMaterialLibrary.json";
import installedPbr from "../../data/installedPbrMaterials.json";
import catalog from "../../../public/asset-catalog/unified.json";
import "./MaterialLibraryBrowser.css";

type Target = "floor" | "wall" | "roof";

type CatalogAsset = {
  id: string;
  name: string;
  type: string;
  provider: string;
  category?: string | null;
  tags?: string[];
  thumbnail?: string | Record<string, string>;
  sourceUrl?: string;
};

const assets = (catalog.assets as CatalogAsset[]).filter(
  asset => asset.type === "textures"
);

function thumbnail(asset: CatalogAsset): string {
  if (typeof asset.thumbnail === "string") return asset.thumbnail;
  return asset.thumbnail?.["256-WEBP"]
    ?? asset.thumbnail?.["256-PNG"]
    ?? asset.thumbnail?.["128-WEBP"]
    ?? "";
}

export default function MaterialLibraryBrowser({
  target,
  onSelect,
  onClose
}: {
  target: Target;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("All");
  const [page, setPage] = useState(1);

  const installed = useMemo(
    () => installedMaterials.filter(m => m.surfaces.includes(target)),
    [target]
  );

  const matches = useMemo(() => {
    const search = query.trim().toLowerCase();

    return assets.filter(asset => {
      if (provider !== "All" && asset.provider !== provider) return false;

      const haystack = [
        asset.name,
        asset.id,
        asset.category ?? "",
        ...(asset.tags ?? [])
      ].join(" ").toLowerCase();

      return !search || haystack.includes(search);
    });
  }, [query, provider]);

  const installedMatches = installed.filter(material =>
    (material.name + " " + material.category)
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const visible = matches.slice(0, page * 48);

  const installedOnline = useMemo(() => {
    const search = query.trim().toLowerCase();

    return installedPbr.filter(material => {
      const text = (
        material.name + " " +
        material.id + " " +
        material.provider
      ).toLowerCase();

      return !search || text.includes(search);
    });
  }, [query]);

  return (
    <div className="techuvo-material-browser" role="dialog" aria-label="Material library">
      <div className="techuvo-material-browser-heading">
        <strong>
          Material library
          <small>{assets.length.toLocaleString()} catalog textures</small>
        </strong>
        <button type="button" onClick={onClose} aria-label="Close material browser">✕</button>
      </div>

      <input
        value={query}
        onChange={event => {
          setQuery(event.target.value);
          setPage(1);
        }}
        placeholder="Search marble, oak, concrete, stone..."
        aria-label="Search material library"
      />

      <select
        value={provider}
        onChange={event => {
          setProvider(event.target.value);
          setPage(1);
        }}
        aria-label="Filter material provider"
      >
        <option value="All">All providers</option>
        <option value="Poly Haven">Poly Haven</option>
        <option value="ambientCG">ambientCG</option>
      </select>

      {provider === "All" && installedMatches.length > 0 && (
        <>
          <p><strong>Installed materials — ready to apply</strong></p>
          <div className="techuvo-material-grid">
            {installedMatches.slice(0, 48).map(material => (
              <button
                type="button"
                key={material.id}
                onClick={() => {
                  onSelect(`library:${material.id}`);
                  onClose();
                }}
              >
                <img loading="lazy" src={material.thumbnail} alt="" />
                <span>{material.name}</span>
                <small>{material.category}</small>
              </button>
            ))}
          </div>
        </>
      )}

      {installedOnline.length > 0 && (
        <>
          <p>
            <strong>Installed PBR materials</strong>
            <small> · {installedOnline.length} ready to apply</small>
          </p>

          <div className="techuvo-material-grid">
            {installedOnline.map(material => {
              const asset = assets.find(
                item => item.id === material.id
              );

              return (
                <button
                  type="button"
                  key={material.id}
                  title={`Apply ${material.name}`}
                  onClick={() => {
                    onSelect(`library:${material.id}`);
                    onClose();
                  }}
                >
                  {asset && (
                    <img
                      loading="lazy"
                      src={thumbnail(asset)}
                      alt=""
                    />
                  )}

                  <span>{material.name}</span>
                  <small>Installed · {material.provider}</small>
                </button>
              );
            })}
          </div>
        </>
      )}

      <p>
        <strong>Online material catalog</strong>
        <small> · {matches.length.toLocaleString()} results</small>
      </p>

      <div className="techuvo-material-grid">
        {visible.map(asset => (
          <button
            type="button"
            key={asset.id}
            title={`${asset.name} — View source and downloads`}
            onClick={() => {
              if (asset.sourceUrl) {
                window.open(asset.sourceUrl, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <img loading="lazy" src={thumbnail(asset)} alt="" />
            <span>{asset.name}</span>
            <small>{asset.provider} · Preview</small>
          </button>
        ))}
      </div>

      {visible.length < matches.length && (
        <button
          type="button"
          className="techuvo-material-more"
          onClick={() => setPage(value => value + 1)}
        >
          Load more ({visible.length} of {matches.length})
        </button>
      )}

      {!matches.length && !installedMatches.length && (
        <p>No matching materials.</p>
      )}

      <small className="techuvo-material-footnote">
        Installed materials can be applied immediately.
        Online catalog entries open their source pages until texture
        download and PBR integration are enabled.
      </small>
    </div>
  );
}
