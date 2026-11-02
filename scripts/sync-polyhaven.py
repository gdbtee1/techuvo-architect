import json
import time
import urllib.request
from pathlib import Path
from datetime import datetime, timezone

BASE = "https://api.polyhaven.com"
OUTPUT = Path("public/asset-catalog")
OUTPUT.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "TechuvoArchitect/1.0",
    "Accept": "application/json",
}

def fetch(url):
    for attempt in range(4):
        try:
            request = urllib.request.Request(
                url, headers=HEADERS
            )
            with urllib.request.urlopen(
                request, timeout=45
            ) as response:
                return json.load(response)
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)

def normalize(asset_id, data, kind):
    return {
        "id": f"polyhaven:{asset_id}",
        "providerId": asset_id,
        "name": data.get("name", asset_id),
        "type": kind,
        "provider": "Poly Haven",
        "license": "CC0",
        "category": data.get("category", "Uncategorized"),
        "categories": data.get("categories", []),
        "tags": data.get("tags", []),
        "description": data.get("description", ""),
        "thumbnail": data.get("thumbnail_url"),
        "sourceUrl": f"https://polyhaven.com/a/{asset_id}",
        "fileManifestUrl": f"{BASE}/files/{asset_id}",
    }

all_assets = []
counts = {}

for kind in ("textures", "models", "hdris"):
    print(f"Fetching all {kind}...", flush=True)

    response = fetch(f"{BASE}/assets?t={kind}")

    if not isinstance(response, dict):
        raise RuntimeError(
            f"Unexpected {kind} API response"
        )

    items = [
        normalize(asset_id, data, kind)
        for asset_id, data in response.items()
        if isinstance(data, dict)
        and data.get("date_published", 0)
            <= datetime.now(timezone.utc).timestamp()
    ]

    all_assets.extend(items)
    counts[kind] = len(items)

    print(f"  Imported {len(items)} {kind}")

all_assets.sort(
    key=lambda item: (
        item["type"],
        item["category"],
        item["name"],
    )
)

catalog = {
    "version": 1,
    "generatedAt": datetime.now(
        timezone.utc
    ).isoformat(),
    "provider": "Poly Haven",
    "counts": counts,
    "total": len(all_assets),
    "assets": all_assets,
}

destination = OUTPUT / "polyhaven.json"
temporary = destination.with_suffix(".json.tmp")
temporary.write_text(
    json.dumps(catalog, separators=(",", ":"))
)
temporary.replace(destination)

print("\n" + "=" * 55)
print("TECHUVO ARCHITECT ASSET CATALOG")
print("=" * 55)

for kind, count in counts.items():
    print(f"{kind}: {count:,}")

print(f"TOTAL: {len(all_assets):,}")
print("Saved:", destination.resolve())
print("No heavy texture or model files downloaded.")
