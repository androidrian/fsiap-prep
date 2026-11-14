"""One-off readability pass: raise the very small font sizes of src/styles.css.

The original design used 8-11 px text almost everywhere, below what is comfortable to read.
This maps each small size to a legible one and leaves sizes >= 14 px untouched.

Usage (from the repo root):  python -P scripts/bump_font_sizes.py
"""
import re
from pathlib import Path

PATH = Path(__file__).resolve().parent.parent / "src" / "styles.css"
SCALE = {7: 11, 8: 11.5, 9: 12, 10: 12.5, 11: 13, 12: 13.5, 13: 14.5}


def bump(match: re.Match[str]) -> str:
    size = float(match.group("size"))
    new = SCALE.get(int(size), size) if size == int(size) else size
    text = f"{new:g}"
    return f"{match.group('head')}{text}px"


def main() -> None:
    css = PATH.read_text(encoding="utf-8")
    if "/* font sizes bumped */" in css:
        print("already bumped")
        return
    size_decl = re.compile(r"(?P<head>font-size:\s*)(?P<size>\d+(?:\.\d+)?)px")
    shorthand = re.compile(r"(?P<head>font:\s*[^;{}]*?\s)(?P<size>\d+(?:\.\d+)?)px(?=[/\s])")
    css, first = size_decl.subn(bump, css)
    css, second = shorthand.subn(bump, css)
    PATH.write_text(css.rstrip() + "\n/* font sizes bumped */\n", encoding="utf-8")
    print(f"font-size declarations: {first}, font shorthands: {second}")


if __name__ == "__main__":
    main()
