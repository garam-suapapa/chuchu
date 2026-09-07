"""Authorized local postprocessing. Originals are never overwritten.

Dependencies: Pillow and numpy. Execute with bundled Python from any cwd.
Removes ONLY edge-connected near-neutral bright checkerboard pixels. This
protects disconnected white eyes/highlights and chromatic cream garment panels.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / 'sources'

def isolate(path):
    original = Image.open(path).convert('RGB')
    rgb = np.asarray(original).astype(np.int16)
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    candidate = (chroma <= 15) & (rgb.min(axis=2) >= 219)
    # Connected component from padded outer canvas, including narrow leg gaps.
    padded = np.pad(candidate.astype(np.uint8) * 255, 1, constant_values=255)
    flood = Image.fromarray(padded).copy()
    ImageDraw.floodfill(flood, (0, 0), 128, thresh=0)
    background = np.asarray(flood)[1:-1, 1:-1] == 128
    alpha = Image.fromarray((~background).astype(np.uint8) * 255)
    # Subpixel antialias before final downsampling; no broad alpha erosion.
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.4))
    rgba = original.convert('RGBA')
    rgba.putalpha(alpha)
    bbox = Image.fromarray((np.asarray(alpha) > 8).astype(np.uint8)*255).getbbox()
    return rgba, bbox, int(background.sum())

def layout(img, bbox, size, region):
    cropped = img.crop(bbox)
    cropped.thumbnail((region[2]-region[0], region[3]-region[1]), Image.Resampling.LANCZOS)
    out = Image.new('RGBA', size, (0, 0, 0, 0))
    x = region[0] + (region[2]-region[0]-cropped.width)//2
    y = region[1] + (region[3]-region[1]-cropped.height)//2
    out.alpha_composite(cropped, (x, y))
    return out

def audit(im):
    a=np.asarray(im.getchannel('A'))
    bbox=Image.fromarray((a>8).astype(np.uint8)*255).getbbox()
    return {'size': list(im.size), 'mode':im.mode, 'alpha_min':int(a.min()), 'alpha_max':int(a.max()),
            'transparent_pixels':int((a==0).sum()), 'partial_alpha_pixels':int(((a>0)&(a<255)).sum()),
            'alpha_gt8_bbox':list(bbox), 'edge_alpha_max':int(max(a[0].max(),a[-1].max(),a[:,0].max(),a[:,-1].max()))}

results={}
for kind,src,out,size,region in [
    ('worn','09-worn-original.png','bangulping_outfit_09-worn.png',(600,700),(48,21,551,671)),
    ('sprite','09-sprite-original.png','bangulping_outfit_09.png',(512,512),(20,20,492,492)),
]:
    isolated,bbox,removed=isolate(SOURCE/src)
    final=layout(isolated,bbox,size,region)
    final.save(HERE/out)
    results[kind]={'source':src,'source_bbox':list(bbox),'removed_source_pixels':removed,**audit(final)}
    colors=[('#f2f2f2','LIGHT'),('#242033','DARK'),('#d84085','MAGENTA'),('#36b45e','GREEN')]
    board=Image.new('RGB',(size[0]*2,size[1]*2),(255,255,255))
    for i,(color,label) in enumerate(colors):
        panel=Image.new('RGBA',size,color)
        panel.alpha_composite(final)
        draw=ImageDraw.Draw(panel)
        draw.text((10,10),label,fill='white' if i else 'black')
        board.paste(panel.convert('RGB'),((i%2)*size[0],(i//2)*size[1]))
    board.save(HERE/f'09-qa-{kind}-contact.png')

(HERE/'09-qa.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(results,ensure_ascii=False,indent=2))
