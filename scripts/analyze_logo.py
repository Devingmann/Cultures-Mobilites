#!/usr/bin/env python3
"""Analyse la structure du logo : densité de pixels non-blancs par ligne/colonne
pour localiser précisément le badge circulaire et les blocs de texte."""
import numpy as np
from PIL import Image

img = Image.open('/home/z/my-project/upload/Gemini_Generated_Image_48g6zb48g6zb48g6.jpg').convert('RGB')
arr = np.array(img).astype(int)
H, W = arr.shape[:2]

nonwhite = arr.min(axis=2) < 235
sat = (arr.max(axis=2) - arr.min(axis=2)) > 45
colored = sat & (arr.max(axis=2) > 90)

rows_nw = nonwhite.sum(axis=1)
rows_c = colored.sum(axis=1)

print('== Bandes de lignes (non-blanc > 30 px) ==')
in_band = False
for y in range(H):
    if rows_nw[y] > 30 and not in_band:
        start, in_band = y, True
    elif rows_nw[y] <= 30 and in_band:
        print(f'  lignes {start}-{y-1}  (haut non-blanc max x = {np.where(nonwhite[start:y].any(axis=0))[0].max() if nonwhite[start:y].any() else "?"})')
        in_band = False
if in_band:
    print(f'  lignes {start}-{H-1}')

print('== Bandes colorées (saturées > 30 px) ==')
in_band = False
for y in range(H):
    if rows_c[y] > 30 and not in_band:
        start, in_band = y, True
    elif rows_c[y] <= 30 and in_band:
        cols = np.where(colored[start:y].any(axis=0))[0]
        print(f'  lignes {start}-{y-1}  x[{cols.min()},{cols.max()}]')
        in_band = False
if in_band:
    cols = np.where(colored[start:H].any(axis=0))[0]
    print(f'  lignes {start}-{H-1}  x[{cols.min()},{cols.max()}]')

print('== Colonnes non-blanches (par blocs de 32) ==')
colsw = nonwhite.sum(axis=0)
for x0 in range(0, W, 64):
    print(f'  x[{x0:4d}-{x0+63:4d}] : {colsw[x0:x0+64].sum():6d}')
