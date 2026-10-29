#!/usr/bin/env python3
"""Vérifie l'étendue réelle du badge avec un seuil intermédiaire (min<210)
dans la zone au-dessus du texte, et denses colonnes par ligne."""
import numpy as np
from PIL import Image

img = Image.open('/home/z/my-project/upload/Gemini_Generated_Image_48g6zb48g6zb48g6.jpg').convert('RGB')
arr = np.array(img).astype(int)
H, W = arr.shape[:2]

# profil des colonnes dans la fenêtre verticale plausible du badge
for th in (210, 225):
    nw = arr.min(axis=2) < th
    band = nw[100:750, :]
    cols = band.sum(axis=0)
    # colonnes avec > 20 px non-blancs
    idx = np.where(cols > 20)[0]
    print(f'seuil min<{th}, y[100,750] : colonnes denses {idx.min()}-{idx.max()}' if len(idx) else f'seuil {th}: rien')
    rows = nw[:, :].sum(axis=1)
    idxr = np.where(rows[:750] > 20)[0]
    print(f'  lignes denses y<750 : {idxr.min()}-{idxr.max()}')

# le badge est-il un cercle ? rayon depuis le centre coloré
ys, xs = np.where((arr.max(axis=2) - arr.min(axis=2) > 45) & (arr.max(axis=2) > 90))
cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
print(f'centre coloré : ({cx:.0f},{cy:.0f}), bbox x[{xs.min()},{xs.max()}] y[{ys.min()},{ys.max()}]')
# histogramme radial approximatif : distance max des pixels colorés au centre
d = np.sqrt((xs - cx) ** 2 + (ys - cy) ** 2)
print(f'distance max au centre : {d.max():.0f} px ; 99e percentile : {np.percentile(d, 99):.0f}')
# dans la fenêtre du badge (cy±300), étendue horizontale des pixels non-blanc<210
win = arr[max(0, int(cy) - 300):int(cy) + 300, :]
nww = win.min(axis=2) < 210
colsw = nww.sum(axis=0)
idx2 = np.where(colsw > 20)[0]
print(f'dans la fenêtre cy±300, colonnes non-blanches(<210) : {idx2.min()}-{idx2.max()}' if len(idx2) else 'rien')
