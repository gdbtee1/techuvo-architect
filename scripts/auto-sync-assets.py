#!/usr/bin/env python3
import json
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
catalog = root / "public/asset-catalog/unified.json"

commands = [
    [sys.executable, "scripts/sync-polyhaven.py"],
    [sys.executable, "scripts/sync-ambientcg.py"],
]

for command in commands:
    print("Running:", " ".join(command), flush=True)
    subprocess.run(command, cwd=root, check=True)

if not catalog.exists():
    raise SystemExit("Unified catalog was not generated.")

data = json.loads(catalog.read_text())
assets = data.get("assets", [])

if not assets:
    raise SystemExit("Unified catalog is empty.")

ids = [asset.get("id") for asset in assets]

if any(not asset_id for asset_id in ids):
    raise SystemExit("Catalog contains missing asset IDs.")

if len(ids) != len(set(ids)):
    raise SystemExit("Catalog contains duplicate asset IDs.")

print("Asset synchronization completed.")
print("Total assets:", len(assets))
print("Unique IDs:", len(set(ids)))
