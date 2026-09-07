"""Create alpha sprites from the preserved ImageGen RGB originals.

Requires Pillow, NumPy and SciPy. Background selection uses connected regions,
not global white replacement, so internal pearl and fabric highlights survive.
The enclosed background region IDs below were manually inspected in originals.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = Path(__file__).parent
OUT = ROOT / 'processed'
OUT.mkdir(exist_ok=True)
# IDs are deterministic for scipy.ndimage.label's 4-connected scan.
ENCLOSED = {
    'bunny-bag': [17],
    'rainbow-bag': [3],
    'moon-pin': [429],
    'flower-wreath': [79, 88, 169, 172],
    'pearl-tiara': [155,159,338,336,45,47,436,429,430,437,532,537,533,536],
    'strawberry-beret': [],
}
report = []
for key, enclosed in ENCLOSED.items():
    original = Image.open(ROOT / f'{key}.png').convert('RGB')
    rgb = np.asarray(original).astype(np.float32)
    low, high = rgb.min(2), rgb.max(2)
    strict = (low >= 242) & (high - low <= 8)
    labels, _ = ndi.label(strict)
    exterior = int(labels[0,0])
    seeds = np.isin(labels, [exterior] + enclosed)
    loose = (low >= 225) & (high - low <= 20)
    background = ndi.binary_propagation(seeds, mask=loose)
    foreground = ~background
    objects, n = ndi.label(foreground)
    areas = np.bincount(objects.ravel())
    # Remove tiny isolated generation specks outside the actual connected item.
    keep = np.where(areas >= 1200)[0]
    keep = keep[keep != 0]
    foreground = np.isin(objects, keep)
    alpha = foreground.astype(np.uint8) * 255
    rgba = np.dstack((rgb.astype(np.uint8), alpha))
    sprite = Image.fromarray(rgba)
    bbox = sprite.getbbox()
    x0,y0,x1,y1 = bbox
    pad = 10
    cropped = sprite.crop((max(0,x0-pad),max(0,y0-pad),min(sprite.width,x1+pad),min(sprite.height,y1+pad)))
    cropped.thumbnail((600,600), Image.Resampling.LANCZOS)
    cropped.save(OUT / f'{key}.png', optimize=True)
    alpha_out = np.asarray(cropped.getchannel('A'))
    report.append({
        'id':key,'originalMode':original.mode,'originalSize':list(original.size),
        'mode':cropped.mode,'size':list(cropped.size),'alphaRange':[int(alpha_out.min()),int(alpha_out.max())],
        'transparentPixels':int((alpha_out==0).sum()),'opaquePixels':int((alpha_out==255).sum()),
        'partiallyTransparentPixels':int(((alpha_out>0)&(alpha_out<255)).sum()),
        'originalObjectBoundingBox':list(bbox),'enclosedBackgroundRegionIds':enclosed,
        'sprite':f'assets/runtime/expansion/accessories/processed/{key}.png',
    })
    assert alpha_out.min()==0 and alpha_out.max()==255

catalog = json.loads((ROOT/'catalog.json').read_text(encoding='utf-8'))
frames = {
 'pearl-tiara': (210,15,180), 'strawberry-beret': (180,0,220),
 'flower-wreath': (175,35,250), 'moon-pin': (410,55,115),
 'bunny-bag': (355,440,130), 'rainbow-bag': (350,450,140),
}
for item in catalog:
    key=item['id']
    found=next(r for r in report if r['id']==key)
    width,height=found['size']
    x,y,w=frames[key]
    h=round(w*height/width)
    item['sprite']=found['sprite']
    item['status']='processed-and-alpha-verified'
    item['runtimeReady']=True
    item['frameNote']='Coordinates for cropped processed sprite on 600x700 doll canvas; contact sheet visually inspected.'
    if 'frames' in item:
        for character, frame in item['frames'].items():
            frame.update(width=w,height=h)
    else:
        item['frame']={'x':x,'y':y,'width':w,'height':h}
(ROOT/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Review every cutout against two contrasting solid backgrounds.
sheet=Image.new('RGB',(1800,1050),'#f2ede7')
draw=ImageDraw.Draw(sheet)
for index,item in enumerate(catalog):
    col,row=index%3,index//3
    x,y=col*600,row*525
    draw.text((x+18,y+14),item['id'],fill='#172433')
    sprite=Image.open(ROOT/'processed'/f"{item['id']}.png").convert('RGBA')
    sprite.thumbnail((275,445),Image.Resampling.LANCZOS)
    for offset,color in [(0,'#1a3c4e'),(300,'#de76a8')]:
        tile=Image.new('RGBA',(292,465),color)
        tile.alpha_composite(sprite,((292-sprite.width)//2,(465-sprite.height)//2))
        sheet.paste(tile.convert('RGB'),(x+offset+4,y+40))
sheet.save(OUT/'contact-sheet.jpg',quality=94)

# Each character/item pairing at the same coordinates used by the runtime.
characters=['hachuping','soraping','challangping','bangulping']
doll_sheet=Image.new('RGB',(1500,1440),'#f3ece5')
draw=ImageDraw.Draw(doll_sheet)
for row,character in enumerate(characters):
    for col,item in enumerate(catalog):
        canvas=Image.new('RGBA',(600,740),'#b8d4dc')
        base=Image.open(ROOT.parents[1]/'characters'/character/'base.png').convert('RGBA')
        canvas.alpha_composite(base,(0,25))
        f=item.get('frames',{}).get(character,item.get('frame'))
        sprite=Image.open(ROOT/'processed'/f"{item['id']}.png").convert('RGBA')
        sprite=sprite.resize((f['width'],f['height']),Image.Resampling.LANCZOS)
        canvas.alpha_composite(sprite,(f['x'],f['y']+25))
        d=ImageDraw.Draw(canvas)
        d.text((12,5),character+' / '+item['id'],fill='#172433')
        canvas.thumbnail((250,350),Image.Resampling.LANCZOS)
        doll_sheet.paste(canvas.convert('RGB'),(col*250,row*360))
doll_sheet.save(OUT/'doll-placement-review.jpg',quality=94)
print(json.dumps(report,indent=2))
