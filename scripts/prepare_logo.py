#!/usr/bin/env python3
"""Logo v4 : masque géométrique autour du badge connu (centre 520,444,
rayon coloré max 311) + QA composite sur fond magenta."""
import numpy as np
from PIL import Image
from scipy import ndimage

SRC = '/home/z/my-project/upload/Gemini_Generated_Image_48g6zb48g6zb48g6.jpg'
OUT = '/home/z/my-project/public/images'

img = Image.open(SRC).convert('RGB')
arr = np.array(img).astype(int)
H, W = arr.shape[:2]

border = np.concatenate([arr[0], arr[-1], arr[:, 0], arr[:, -1]])
ref = np.median(border, axis=0)
bg_like = (np.abs(arr - ref) < 34).all(axis=2)
labels, n = ndimage.label(bg_like)
border_labels = set(labels[0]) | set(labels[-1]) | set(labels[:, 0]) | set(labels[:, -1])
border_labels.discard(0)
is_bg = np.isin(labels, list(border_labels))

fg = ~is_bg
labels_fg, nf = ndimage.label(fg)
sizes = ndimage.sum(fg, labels_fg, range(1, nf + 1))
keep = np.zeros(nf + 1, bool)
keep[1:] = sizes > 60
fg_clean = keep[labels_fg]

# où commence le titre ?
rows = fg_clean.sum(axis=1)
gap_rows = [y for y in range(690, 850) if rows[y] < 5]
print('gap entre badge et titre autour de :', gap_rows[:8], '...' if len(gap_rows) > 8 else '')

# masque badge : géométrique
yy, xx = np.mgrid[0:H, 0:W]
dist = np.sqrt((xx - 520) ** 2 + (yy - 444) ** 2)
badge_mask = fg_clean & (yy < 740) & (dist < 360)
ys, xs = np.where(badge_mask)
print(f'badge : x[{xs.min()},{xs.max()}] y[{ys.min()},{ys.max()}], dist max {dist[badge_mask].max():.0f}')

alpha = np.where(badge_mask, 255, 0).astype(float)
alpha_f = ndimage.gaussian_filter(alpha, sigma=0.8)
alpha_f = np.where(badge_mask, np.maximum(alpha_f, 120), alpha_f)  # garder l'intérieur opaque
rgba = np.dstack([np.array(img), alpha_f.astype(np.uint8)])

pad = 16
y0, y1 = max(0, ys.min() - pad), min(H, ys.max() + 1 + pad)
x0, x1 = max(0, xs.min() - pad), min(W, xs.max() + 1 + pad)
badge = Image.fromarray(rgba[y0:y1, x0:x1])
badge.save(f'{OUT}/logo-badge.png')
print(f'logo-badge.png : {badge.size}')

# QA : composite sur magenta
qa = Image.new('RGB', badge.size, (200, 40, 180))
qa.paste(badge, (0, 0), badge)
qa.save('/home/z/my-project/scripts/qa-badge.png')

# variantes carrées
for s in (512, 192, 180, 64, 32):
    side = max(badge.size)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(badge, ((side - badge.size[0]) // 2, (side - badge.size[1]) // 2), badge)
    canvas.resize((s, s), Image.LANCZOS).save(f'{OUT}/logo-{s}.png')

# transparence statistique
a = np.array(badge)[:, :, 3]
print(f'alpha<10 : {(a < 10).mean() * 100:.0f}%  alpha>200 : {(a > 200).mean() * 100:.0f}%')
print('OK')
