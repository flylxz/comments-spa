#!/usr/bin/env python3
"""Build comments-spa.mwb using MySQL Workbench GRT API (preferred) or XML fallback."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "comments-spa.mwb"
WB_SCRIPT = Path(__file__).resolve().parent / "create_model_wb.py"

MACOS_WORKBENCH = Path("/Applications/MySQLWorkbench.app/Contents/MacOS/MySQLWorkbench")


def build_with_workbench() -> bool:
    if not MACOS_WORKBENCH.is_file():
        return False

    before_mtime = OUTPUT.stat().st_mtime if OUTPUT.is_file() else 0.0

    result = subprocess.run(
        [
            str(MACOS_WORKBENCH),
            "-run-script",
            str(WB_SCRIPT),
            "-quit-when-done",
        ],
        capture_output=True,
        text=True,
        check=False,
        timeout=120,
    )

    if result.stdout.strip():
        print(result.stdout.strip())
    if result.stderr.strip():
        print(result.stderr.strip(), file=sys.stderr)

    if result.returncode != 0:
        print(f"MySQL Workbench export failed (exit {result.returncode})", file=sys.stderr)
        return False

    if not OUTPUT.is_file() or OUTPUT.stat().st_mtime <= before_mtime:
        print("MySQL Workbench did not update the .mwb file", file=sys.stderr)
        return False

    return True


def main() -> None:
    if build_with_workbench():
        print(f"Wrote {OUTPUT} via MySQL Workbench")
        return

    fallback = Path(__file__).resolve().parent / "build_mwb_xml.py"
    if not fallback.is_file():
        print(
            "MySQL Workbench not found and XML fallback script is missing.",
            file=sys.stderr,
        )
        sys.exit(1)

    print("MySQL Workbench unavailable — using XML fallback", file=sys.stderr)
    result = subprocess.run([sys.executable, str(fallback)], check=False)
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
