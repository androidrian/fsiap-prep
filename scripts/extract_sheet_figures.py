"""Extract the figures embedded in the TP sheets (docs-class/Folha_N_2025_26.pdf)
and save them as public/figures/fN-EE.png, one per exercise.

The mapping below (page/image index inside the PDF -> exercise number) was
checked by eye against the sheets. Requires pypdf and Pillow.

Usage (from the repo root):  python -P scripts/extract_sheet_figures.py
"""
from __future__ import annotations

import io
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "docs-class"
TARGET = ROOT / "public" / "figures"
MIN_WIDTH = 420

# sheet -> exercise number -> list of (page, image index on that page), 1-based
FIGURES: dict[int, dict[int, list[tuple[int, int]]]] = {
    1: {
        3: [(1, 2)], 5: [(1, 3)], 4: [(1, 4)], 7: [(2, 1)], 6: [(2, 2)], 8: [(2, 3)],
        10: [(3, 2)], 13: [(3, 3)], 11: [(3, 4)], 16: [(4, 1)], 17: [(4, 2)],
        18: [(5, 2)], 19: [(5, 3)],
    },
    2: {
        7: [(1, 2)], 9: [(2, 1)], 11: [(2, 2)], 8: [(2, 3)], 14: [(3, 2)], 16: [(3, 3)],
        17: [(3, 4)], 18: [(4, 1)], 19: [(4, 2)], 20: [(4, 3)], 21: [(4, 4)],
        22: [(5, 2)], 23: [(5, 3)], 24: [(5, 4)],
    },
    3: {1: [(1, 2)], 3: [(1, 3)], 7: [(2, 1)], 15: [(4, 1)], 16: [(4, 2), (4, 3)]},
    4: {8: [(2, 1)], 9: [(2, 2)], 11: [(3, 2)], 10: [(3, 3)], 13: [(3, 4)], 17: [(4, 1)], 18: [(4, 2)]},
    5: {7: [(1, 2)], 1: [(1, 3)], 8: [(2, 1)], 17: [(3, 2)], 19: [(4, 1)]},
}


def flatten(data: bytes) -> Image.Image:
    image = Image.open(io.BytesIO(data))
    if image.mode != "RGB":
        rgba = image.convert("RGBA")
        canvas = Image.new("RGBA", rgba.size, "white")
        canvas.alpha_composite(rgba)
        image = canvas.convert("RGB")
    return image


def side_by_side(images: list[Image.Image]) -> Image.Image:
    if len(images) == 1:
        return images[0]
    gap = 40
    height = max(image.height for image in images)
    width = sum(image.width for image in images) + gap * (len(images) - 1)
    canvas = Image.new("RGB", (width, height), "white")
    x = 0
    for image in images:
        canvas.paste(image, (x, (height - image.height) // 2))
        x += image.width + gap
    return canvas


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    for sheet, mapping in FIGURES.items():
        reader = PdfReader(str(SOURCE / f"Folha_{sheet}_2025_26.pdf"))
        page_images = {index: list(page.images) for index, page in enumerate(reader.pages, start=1)}
        for exercise, refs in sorted(mapping.items()):
            parts = [flatten(page_images[page][position - 1].data) for page, position in refs]
            figure = side_by_side(parts)
            if figure.width < MIN_WIDTH:
                scale = MIN_WIDTH / figure.width
                figure = figure.resize((MIN_WIDTH, round(figure.height * scale)), Image.Resampling.LANCZOS)
            target = TARGET / f"f{sheet}-{exercise:02d}.png"
            figure.save(target, optimize=True)
            print(f"{target.relative_to(ROOT)} {figure.size}")


if __name__ == "__main__":
    main()
