"""Reproducible local sprite extraction; retains generated originals unchanged.

Run: python assets/runtime/expansion/props/process_props.py
Uses only Pillow, NumPy, and SciPy. Authorized by the user for local cleanup.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'processed'
OUT.mkdir(exist_ok=True)
VOID_SEEDS = {'picnic-basket': [(0.5, 0.26)], 'flower-teacup': [(0.86, 0.39)]}
report = []
sprites = []
for path in sorted(ROOT.glob('*.png')):
    if path.stem == 'contact-sheet':
        continue
    source = Image.open(path).convert('RGB')
    rgb = np.asarray(source).astype(np.float32)
    low, high = rgb.min(axis=2), rgb.max(axis=2)
    neutral = (low > 212) & ((high - low) < 23)
    if path.stem == 'strawberry-cake':
        # Cream has near-white highlights at its silhouette: distinguish its
        # warm tint from the very neutral white generated background.
        neutral = (low > 235) & ((high - low) < 7)
    seed = np.zeros(neutral.shape, dtype=bool)
    seed[0, :] = seed[-1, :] = True
    seed[:, 0] = seed[:, -1] = True
    for x, y in VOID_SEEDS.get(path.stem, []):
        seed[int(y * seed.shape[0]), int(x * seed.shape[1])] = True
    bg = ndi.binary_propagation(seed & neutral, mask=neutral)
    fg = ~bg
    labels, count = ndi.label(fg)
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    fg = labels == sizes.argmax()
    # Fill only tiny pinholes; the large handle voids must stay transparent.
    holes = ndi.binary_fill_holes(fg) & ~fg
    hole_labels, _ = ndi.label(holes)
    hole_sizes = np.bincount(hole_labels.ravel())
    fg |= holes & (hole_sizes[hole_labels] < 400)
    # Antialias inside the outline. Keep distant background alpha exactly zero.
    dist = ndi.distance_transform_edt(fg)
    alpha = np.clip((dist - 0.55) / 1.3, 0, 1)
    # Remove the white matte only at semitransparent boundary pixels.
    boundary = (alpha > 0) & (alpha < 1)
    clean = rgb.copy()
    clean[boundary] = np.clip((rgb[boundary] - 255 * (1-alpha[boundary,None])) / alpha[boundary,None], 0, 255)
    clean[alpha == 0] = 0
    rgba = Image.fromarray(np.dstack([clean.astype(np.uint8), np.round(alpha*255).astype(np.uint8)]), 'RGBA')
    box = rgba.getbbox()
    cropped = rgba.crop(box)
    cropped.thumbnail((580, 580), Image.Resampling.LANCZOS)
    final = Image.new('RGBA', (640, 640))
    final.alpha_composite(cropped, ((640-cropped.width)//2, (640-cropped.height)//2))
    dest = OUT / path.name
    final.save(dest)
    a = np.array(final.getchannel('A'))
    report.append({'id':path.stem,'source':path.name,'output':'processed/'+path.name,'mode':'RGBA','size':[640,640], 'alphaMin':int(a.min()),'alphaMax':int(a.max()),'transparentPixels':int((a==0).sum()),'partialAlphaPixels':int(((a>0)&(a<255)).sum()),'borderTransparent':bool(np.all(a[0,:]==0) and np.all(a[-1,:]==0) and np.all(a[:,0]==0) and np.all(a[:,-1]==0)), 'sourceBounds':list(box)})
    sprites.append((path.stem, final))

sheet = Image.new('RGB',(1800,900),(28,43,69))
draw=ImageDraw.Draw(sheet)
for i,(name,sprite) in enumerate(sprites):
    x=(i%3)*600; y=(i//3)*450
    for half,color in enumerate([(28,43,69),(116,198,170)]):
        tile=Image.new('RGBA',(300,420),color+(255,))
        thumb=sprite.copy(); thumb.thumbnail((296,390),Image.Resampling.LANCZOS)
        tile.alpha_composite(thumb,((300-thumb.width)//2,25+(390-thumb.height)//2))
        sheet.paste(tile.convert('RGB'),(x+half*300,y))
    draw.text((x+10,y+426),name,fill='white')
sheet.save(OUT/'contact-sheet.jpg',quality=94)
detail = Image.new('RGBA',(1280,640),(28,43,69,255))
detail.alpha_composite(Image.open(OUT/'teddy-bear.png'),(0,0))
detail.alpha_composite(Image.open(OUT/'strawberry-cake.png'),(640,0))
detail.convert('RGB').save(OUT/'detail-check.jpg',quality=98)
(ROOT/'validation.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
catalog=json.loads((ROOT/'catalog.json').read_text(encoding='utf-8'))
for row in catalog:
    row['sourceSprite']='assets/runtime/expansion/props/'+row['id']+'.png'
    row['sprite']='assets/runtime/expansion/props/processed/'+row['id']+'.png'
    row['runtimeReady']=True
    row['status']='ready-local-alpha-cleanup'
(ROOT/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2))
