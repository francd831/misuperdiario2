"""Normalize transparent sprite sheets so neighboring frames cannot bleed."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter


def components(alpha: Image.Image, threshold: int = 10) -> list[tuple[int, tuple[int, int, int, int], set[int]]]:
    width, height = alpha.size
    pixels = alpha.load()
    visited = bytearray(width * height)
    found: list[tuple[int, tuple[int, int, int, int], set[int]]] = []

    for y in range(height):
        for x in range(width):
            start = y * width + x
            if visited[start] or pixels[x, y] <= threshold:
                continue
            queue = deque([(x, y)])
            visited[start] = 1
            members: set[int] = set()
            min_x = max_x = x
            min_y = max_y = y
            while queue:
                current_x, current_y = queue.popleft()
                index = current_y * width + current_x
                members.add(index)
                min_x = min(min_x, current_x)
                max_x = max(max_x, current_x)
                min_y = min(min_y, current_y)
                max_y = max(max_y, current_y)
                for next_x, next_y in ((current_x - 1, current_y), (current_x + 1, current_y), (current_x, current_y - 1), (current_x, current_y + 1)):
                    if not (0 <= next_x < width and 0 <= next_y < height):
                        continue
                    next_index = next_y * width + next_x
                    if visited[next_index] or pixels[next_x, next_y] <= threshold:
                        continue
                    visited[next_index] = 1
                    queue.append((next_x, next_y))
            found.append((len(members), (min_x, min_y, max_x + 1, max_y + 1), members))
    return found


def normalize(source: Path, destination: Path, columns: int, rows: int, inset: int) -> None:
    image = Image.open(source).convert("RGBA")
    cell_width = image.width // columns
    cell_height = image.height // rows
    output = Image.new("RGBA", (cell_width * columns, cell_height * rows))

    for row_index in range(rows):
        top = row_index * cell_height
        row = image.crop((0, top, output.width, top + cell_height))
        found = sorted(components(row.getchannel("A")), key=lambda item: item[0], reverse=True)[:columns]
        if len(found) != columns:
            raise RuntimeError(f"Expected {columns} sprites in row {row_index + 1}, found {len(found)}")
        found.sort(key=lambda item: (item[1][0] + item[1][2]) / 2)
        max_width = max(item[1][2] - item[1][0] for item in found)
        max_height = max(item[1][3] - item[1][1] for item in found)
        scale = min((cell_width - inset * 2) / max_width, (cell_height - inset * 2) / max_height, 1)

        for column_index, (_, box, members) in enumerate(found):
            mask = Image.new("L", row.size)
            mask_pixels = mask.load()
            for index in members:
                mask_pixels[index % row.width, index // row.width] = 255
            mask = mask.filter(ImageFilter.MaxFilter(5))
            isolated = Image.new("RGBA", row.size)
            isolated.paste(row, mask=Image.composite(row.getchannel("A"), Image.new("L", row.size), mask))
            sprite = isolated.crop(box)
            resized = sprite.resize((max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale))), Image.Resampling.LANCZOS)
            x = column_index * cell_width + (cell_width - resized.width) // 2
            y = row_index * cell_height + (cell_height - resized.height) // 2
            output.alpha_composite(resized, (x, y))

    output.save(destination, "WEBP", quality=88, method=6)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--columns", type=int, default=8)
    parser.add_argument("--rows", type=int, default=4)
    parser.add_argument("--inset", type=int, default=12)
    arguments = parser.parse_args()
    normalize(arguments.input, arguments.output, arguments.columns, arguments.rows, arguments.inset)
