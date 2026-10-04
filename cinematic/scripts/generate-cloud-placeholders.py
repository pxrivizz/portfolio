"""Original procedural RGBA placeholders, no source/reference imagery."""
from pathlib import Path
import math
import random
from PIL import Image, ImageFilter

OUT = Path(__file__).resolve().parents[1] / 'public/assets/clouds'
WIDTH, HEIGHT = 1024, 512

def noise(seed):
    rng = random.Random(seed)
    layers = []
    for cells, weight in [(8, .48), (16, .27), (32, .15), (64, .07), (128, .03)]:
        grid = Image.new('L', (cells * 2, cells))
        grid.putdata([rng.randrange(256) for _ in range(cells * cells * 2)])
        layers.append((list(grid.resize((WIDTH, HEIGHT), Image.Resampling.BICUBIC).getdata()), weight))
    return [sum(layer[i] * weight for layer, weight in layers) / 255 for i in range(WIDTH * HEIGHT)]

for index, name in enumerate(['far', 'middle', 'near']):
    rng = random.Random(120 + index)
    field = noise(20 + index)
    lobes = [(rng.uniform(.24, .76), rng.uniform(.35, .65), rng.uniform(.10, .22), rng.uniform(.14, .29)) for _ in range(15)]
    pixels = []
    for y in range(HEIGHT):
        v = y / (HEIGHT - 1)
        for x in range(WIDTH):
            u = x / (WIDTH - 1)
            n = field[y * WIDTH + x]
            billow = max(math.exp(-((u-cx)/rx)**2 - ((v-cy)/ry)**2) for cx, cy, rx, ry in lobes)
            density = billow + (n - .5) * .5
            edge = max(0, min(1, (density - .27) / .22))
            alpha = int(255 * edge * edge * (3 - 2 * edge))
            shade = int(max(0, min(255, 171 + n * 72 + billow * 13 - v * 9)))
            pixels.append((shade, shade, shade, alpha))
    image = Image.new('RGBA', (WIDTH, HEIGHT))
    image.putdata(pixels)
    image = image.filter(ImageFilter.GaussianBlur(1.3))
    image.save(OUT / f'{name}.png', optimize=True)
    print(name, (OUT / f'{name}.png').stat().st_size)

star = Image.new('RGBA', (32, 32))
star.putdata([(255, 255, 255, int(255 * max(0, 1 - math.hypot((x-15.5)/15.5, (y-15.5)/15.5)) ** 1.8)) for y in range(32) for x in range(32)])
star.save(OUT / 'star.png')
