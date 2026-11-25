#!/usr/bin/env python3
"""Package the readable extension source files into the installable ZIP."""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "src"
OUTPUT = ROOT / "dist" / "Fluid-for-YouTube.zip"


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(OUTPUT, "w", compression=ZIP_DEFLATED) as package:
        for path in sorted(item for item in SOURCE.rglob("*") if item.is_file()):
            package.write(path, path.relative_to(SOURCE).as_posix())
        package.write(ROOT / "LICENSE", "LICENSE")
    print(OUTPUT)


if __name__ == "__main__":
    main()
