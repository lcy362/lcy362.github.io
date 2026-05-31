#!/usr/bin/env python3
"""
生成博客顶部图（hero image）：1920×600，"聚沙成塔"概念
沙漠场景 + 沙粒堆积成塔 + 暖色调自然光 + 无文字
"""
from PIL import Image, ImageDraw, ImageFilter
import random
import math

WIDTH, HEIGHT = 1920, 600
img = Image.new('RGB', (WIDTH, HEIGHT))
draw = ImageDraw.Draw(img)

random.seed(42)

# === 天空渐变（温暖日落色调） ===
for y in range(HEIGHT):
    ratio = y / HEIGHT
    r = int(180 + 75 * ratio)
    g = int(140 + 40 * ratio - 60 * ratio**2)
    b = int(160 - 100 * ratio)
    draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

# === 太阳（右上方，暖光） ===
sun_x, sun_y = 1500, 120
for radius in range(120, 0, -1):
    alpha_ratio = radius / 120
    r = int(255 * alpha_ratio + (1 - alpha_ratio) * 255)
    g = int(230 * alpha_ratio + (1 - alpha_ratio) * 220)
    b = int(150 * alpha_ratio + (1 - alpha_ratio) * 180)
    draw.ellipse([sun_x - radius, sun_y - radius, sun_x + radius, sun_y + radius], fill=(r, g, b))

# === 地平线 ===
horizon_y = 380

# === 沙丘地面 ===
for y in range(horizon_y, HEIGHT):
    ratio = (y - horizon_y) / (HEIGHT - horizon_y)
    r = int(210 - 40 * ratio)
    g = int(175 - 50 * ratio)
    b = int(110 - 30 * ratio)
    draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

# 重新绘制地面轮廓
for x in range(0, WIDTH):
    base_y = horizon_y + 40 + 20 * math.sin(x * 0.003) + 10 * math.sin(x * 0.008 + 1)
    for y in range(int(base_y), HEIGHT):
        ratio = (y - horizon_y) / (HEIGHT - horizon_y)
        r = int(210 - 40 * ratio + random.randint(-5, 5))
        g = int(175 - 50 * ratio + random.randint(-5, 5))
        b = int(110 - 30 * ratio + random.randint(-3, 3))
        r = max(0, min(255, r))
        g = max(0, min(255, g))
        b = max(0, min(255, b))
        img.putpixel((x, y), (r, g, b))

# === 沙塔（聚沙成塔 - 核心概念）===
tower_center_x = 960
tower_base_y = horizon_y + 30
tower_height = 280

for level in range(tower_height):
    y = tower_base_y - level
    tier = level / tower_height
    width = int(200 * (1 - tier ** 0.8))
    if level % 60 < 5:
        width += 15

    sand_r = int(225 - 30 * tier)
    sand_g = int(185 - 40 * tier)
    sand_b = int(120 - 20 * tier)

    for x in range(tower_center_x - width, tower_center_x + width):
        if 0 <= x < WIDTH:
            noise = random.randint(-8, 8)
            pr = max(0, min(255, sand_r + noise))
            pg = max(0, min(255, sand_g + noise))
            pb = max(0, min(255, sand_b + noise))
            img.putpixel((x, y), (pr, pg, pb))

# === 飘散的沙粒 ===
for _ in range(800):
    gx = random.randint(tower_center_x - 400, tower_center_x + 400)
    gy = random.randint(horizon_y - 100, tower_base_y)
    dist = abs(gx - tower_center_x)
    intensity = max(0, 1.0 - dist / 400)
    if random.random() < intensity:
        grain_size = random.randint(1, 3)
        gr = random.randint(200, 245)
        gg = random.randint(170, 210)
        gb = random.randint(100, 150)
        draw.ellipse([gx, gy, gx + grain_size, gy + grain_size], fill=(gr, gg, gb))

# === 风吹沙纹 ===
for _ in range(200):
    sx = random.randint(tower_center_x - 350, tower_center_x + 350)
    sy = random.randint(horizon_y - 60, tower_base_y)
    length = random.randint(10, 60)
    gr = random.randint(200, 240)
    gg = random.randint(170, 200)
    gb = random.randint(100, 140)
    for dx in range(length):
        fade = 1.0 - dx / length
        cr = int(gr * fade + 180 * (1 - fade))
        cg = int(gg * fade + 140 * (1 - fade))
        cb = int(gb * fade + 160 * (1 - fade))
        if 0 <= sx + dx < WIDTH and 0 <= sy < HEIGHT:
            img.putpixel((sx + dx, sy), (cr, cg, cb))

# === 远处的小沙丘 ===
mounds = [(600, 25), (1350, 20), (400, 15), (1600, 18)]
for mx, mh in mounds:
    for level in range(mh):
        y = tower_base_y - level
        width = int(60 * (1 - level / mh))
        for x in range(mx - width, mx + width):
            if 0 <= x < WIDTH:
                ratio = level / mh
                noise = random.randint(-5, 5)
                cr = int(215 - 25 * ratio + noise)
                cg = int(180 - 35 * ratio + noise)
                cb = int(115 - 20 * ratio + noise)
                cr = max(0, min(255, cr))
                cg = max(0, min(255, cg))
                cb = max(0, min(255, cb))
                img.putpixel((x, y), (cr, cg, cb))

# === 太阳光线 ===
for angle_offset in range(-3, 4):
    angle = math.radians(angle_offset * 5)
    for dist in range(50, 600):
        rx = int(sun_x + dist * math.cos(angle + 0.8))
        ry = int(sun_y + dist * math.sin(angle + 0.8))
        if 0 <= rx < WIDTH and 0 <= ry < HEIGHT:
            fade = max(0, 1.0 - dist / 600)
            alpha = int(15 * fade)
            if alpha > 0:
                pr, pg, pb = img.getpixel((rx, ry))
                pr = min(255, pr + alpha)
                pg = min(255, pg + int(alpha * 0.8))
                pb = min(255, pb + int(alpha * 0.4))
                img.putpixel((rx, ry), (pr, pg, pb))

# === 轻微模糊，增加自然感 ===
img = img.filter(ImageFilter.GaussianBlur(radius=1.2))

# === 保存 ===
output_path = '/Users/lcy/blogs/hero-banner.png'
img.save(output_path, 'PNG', quality=95)
print(f"Hero image saved to: {output_path}")
print(f"Size: {img.size[0]}x{img.size[1]} pixels")
