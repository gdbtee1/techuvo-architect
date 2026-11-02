import json
import time
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path("public/asset-catalog")
ROOT.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "TechuvoArchitect/1.0 (asset catalog)",
    "Accept": "application/json",
}

def fetch(url):
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=60) as response:
                return json.load(response)
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)

def normalize(item):
    asset_id = item.get("assetId") or item.get("id")
    if not asset_id:
        return None

    asset_id = str(asset_id)
    name = item.get("displayName") or item.get("name") or asset_id

    preview = (
        item.get("previewImage")
        or item.get("previewImageUrl")
        or f"https://ambientcg.com/get?file={asset_id}_Preview.jpg"
    )

    return {
        "id": f"ambientcg:{asset_id}",
        "providerId": asset_id,
        "name": name,
        "type": "textures",
        "provider": "ambientCG",
        "license": "CC0",
        "category": item.get("category", "Materials"),
        "categories": item.get("categories", []),
        "tags": item.get("tags", []),
        "description": item.get("description", ""),
        "thumbnail": preview,
        "sourceUrl": f"https://ambientcg.com/view?id={asset_id}",
        "downloadPage": f"https://ambientcg.com/view?id={asset_id}",
    }

assets = {}
offset = 0
limit = 100
pages = 0

print("Importing ambientCG material catalog...")

while True:
    params = urllib.parse.urlencode({
        "type": "Material",
        "limit": limit,
        "offset": offset,
    })

    url = "https://ambientcg.com/api/v2/full_json?" + params
    response = fetch(url)

    items = response.get("foundAssets", [])

    if not isinstance(items, list):
        raise RuntimeError("Unexpected ambientCG API response")

    for item in items:
        normalized = normalize(item)
        if normalized:
            assets[normalized["id"]] = normalized

    pages += 1
    print(f"Page {pages}: {len(items)} records; total {len(assets)}")

    if len(items) < limit:
        break

    offset += limit
    time.sleep(0.25)

ambient = sorted(assets.values(), key=lambda a: a["name"])

ambient_path = ROOT / "ambientcg.json"
ambient_path.write_text(json.dumps({
    "provider": "ambientCG",
    "total": len(ambient),
    "assets": ambient,
}, separators=(",", ":")))

poly_path = ROOT / "polyhaven.json"

if not poly_path.exists():
    raise SystemExit("Poly Haven catalog missing. No unified catalog written.")

poly = json.loads(poly_path.read_text())
merged = {}

for asset in poly["assets"] + ambient:
    merged[asset["id"]] = asset

unified = {
    "version": 1,
    "generatedAt": datetime.now(timezone.utc).isoformat(),
    "total": len(merged),
    "counts": {
        "polyhaven": len(poly["assets"]),
        "ambientcg": len(ambient),
    },
    "assets": sorted(
        merged.values(),
        key=lambda a: (a["type"], a["name"])
    ),
}

output = ROOT / "unified.json"
temp = output.with_suffix(".json.tmp")
temp.write_text(json.dumps(unified, separators=(",", ":")))
temp.replace(output)

print("\n" + "=" * 55)
print("TECHUVO ARCHITECT — UNIFIED ASSET LIBRARY")
print("=" * 55)
print(f"Poly Haven: {len(poly['assets']):,}")
print(f"ambientCG:  {len(ambient):,}")
print(f"TOTAL:      {len(merged):,}")
print("Saved:", output.resolve())
print("Texture downloads: none")
