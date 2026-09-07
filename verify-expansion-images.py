"""Read-only asset QA plus contact sheets. Run with Python, Pillow and NumPy."""
from pathlib import Path
import hashlib
import json
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
BASE = ROOT / 'assets/runtime/expansion'
OUT = ROOT / 'artifacts/expansion-qa'
OUT.mkdir(parents=True, exist_ok=True)
issues, files, originals = [], [], []
for entry in json.loads((BASE / 'originals-index.json').read_text(encoding='utf-8-sig')):
    source = ROOT / entry['path']
    unchanged = source.is_file() and hashlib.sha256(source.read_bytes()).hexdigest() == entry['sha256']
    originals.append({'path': entry['path'], 'unchanged': unchanged})
    if not unchanged:
        issues.append(f"Original changed: {entry['path']}")

catalogs = ['backgrounds', 'accessories', 'props'] + [f'outfits/{c}' for c in ['hachuping','soraping','challangping','bangulping']]
outfit_cards, object_cards = [], []
for group in catalogs:
    entries = json.loads((BASE / group / 'catalog.json').read_text(encoding='utf-8-sig'))
    for entry in entries:
        if group != 'backgrounds' and entry.get('runtimeReady') is not True:
            issues.append(f"Not ready: {entry['id']}")
        for role in ['image', 'sprite', 'wornSprite']:
            if role not in entry:
                continue
            rel = entry[role]
            with Image.open(ROOT / rel) as image:
                rgba = image.convert('RGBA')
                alpha = np.array(rgba.getchannel('A'))
                bounds = rgba.getchannel('A').getbbox()
                stats = {'id': entry['id'], 'role': role, 'path': rel, 'size': list(image.size),
                         'transparentPixels': int((alpha == 0).sum()), 'opaquePixels': int((alpha == 255).sum()),
                         'partialAlphaPixels': int(((alpha > 0) & (alpha < 255)).sum()), 'bounds': bounds}
                if group != 'backgrounds':
                    if stats['transparentPixels'] == 0 or stats['opaquePixels'] == 0:
                        issues.append(f'Invalid alpha: {rel}')
                    edge = np.concatenate([alpha[0], alpha[-1], alpha[:,0], alpha[:,-1]])
                    stats['visibleBorderPixels'] = int((edge > 16).sum())
                    if stats['visibleBorderPixels']:
                        issues.append(f'Visible image touches canvas edge: {rel}')
                if role == 'wornSprite' and image.size != (600, 700):
                    issues.append(f'Wrong worn canvas: {rel}')
                files.append(stats)
        if group.startswith('outfits/'):
            outfit_cards.append(entry)
        elif group in ['accessories', 'props']:
            object_cards.append(entry)

def paste_contained(canvas, source, box):
    im = Image.open(ROOT / source).convert('RGBA')
    im.thumbnail((box[2], box[3]), Image.Resampling.LANCZOS)
    canvas.alpha_composite(im, (box[0] + (box[2]-im.width)//2, box[1] + (box[3]-im.height)//2))

for label, entries, cols, cw, ch in [('outfits', outfit_cards, 4, 450, 420), ('objects', object_cards, 4, 320, 330)]:
    sheet = Image.new('RGBA', (cols*cw, ((len(entries)+cols-1)//cols)*ch), '#506777')
    draw = ImageDraw.Draw(sheet)
    for i, entry in enumerate(entries):
        x, y = i%cols*cw, i//cols*ch
        draw.rectangle((x+4,y+4,x+cw-4,y+ch-4),fill='#d3e7d8' if i%2 else '#506777')
        draw.text((x+12,y+12),entry['id'],fill='black' if i%2 else 'white')
        if label == 'outfits':
            paste_contained(sheet, entry['wornSprite'], (x+8,y+36,270,ch-44))
            paste_contained(sheet, entry['sprite'], (x+284,y+70,155,ch-90))
        else:
            paste_contained(sheet,entry['sprite'],(x+20,y+40,cw-40,ch-60))
    sheet.convert('RGB').save(OUT / f'{label}-contact-sheet.jpg', quality=92)

report = {'status': 'failed' if issues else 'passed', 'catalogAssets': len(outfit_cards)+len(object_cards)+4,
          'selectedImages': len(files), 'originalFilesChecked': len(originals),
          'originalsUnchanged': all(x['unchanged'] for x in originals), 'issues': issues, 'files': files}
(OUT / 'image-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k != 'files'}, ensure_ascii=False, indent=2))
raise SystemExit(bool(issues))
