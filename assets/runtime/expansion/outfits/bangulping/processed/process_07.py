"""Reproduce approved local background removal for Bangulping pajamas.
Requires Pillow and numpy. Original generated PNGs remain unchanged.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import json

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent
reports = []
for suffix in ('-worn', ''):
    name = f'bangulping_outfit_07{suffix}.png'
    src = Image.open(SOURCE / name).convert('RGB')
    rgb = np.array(src).astype(np.int16)
    spread = rgb.max(2) - rgb.min(2)
    # Only neutral high-value pixels can be background. Gold stars, cream
    # fabric, aqua, skin and hair remain foreground. Connectivity protects
    # enclosed white eyes/highlights even when they share background colors.
    candidate = (spread <= 12) & (rgb.min(2) >= 210)
    mask = Image.fromarray(np.where(candidate, 0, 255).astype(np.uint8)).copy()
    for xy in [(0,0), (src.width-1,0), (0,src.height-1), (src.width-1,src.height-1)]:
        ImageDraw.floodfill(mask, xy, 128, thresh=0)
    exterior = np.array(mask) == 128
    alpha = Image.fromarray(np.where(exterior,0,255).astype(np.uint8))
    # Remove a subpixel neutral fringe at the source boundary before scaling.
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.35))
    rgba = src.convert('RGBA')
    rgba.putalpha(alpha)
    bbox = alpha.getbbox()
    cropped = rgba.crop(bbox)
    if suffix:
        canvas_size = (600,700)
        target = (48,21,551,671)
        fit = (503,650)
    else:
        canvas_size = (512,512)
        target = (20,20,492,492)
        fit = (472,472)
    cropped.thumbnail(fit,Image.Resampling.LANCZOS)
    left=round((target[0]+target[2]-cropped.width)/2)
    top=round((target[1]+target[3]-cropped.height)/2)
    out=Image.new('RGBA',canvas_size,(0,0,0,0))
    out.alpha_composite(cropped,(left,top))
    out.save(HERE/name)
    aa=np.array(out)[:,:,3]
    panels=[]
    for color in ('#183247','#eb4daa','#f5c643'):
        panel=Image.new('RGBA',out.size,color)
        panel.alpha_composite(out)
        panels.append(panel.convert('RGB'))
    sheet=Image.new('RGB',(out.width*3,out.height))
    for i,panel in enumerate(panels): sheet.paste(panel,(out.width*i,0))
    sheet.save(HERE/f'07-qa{suffix or "-selection"}.jpg',quality=95)
    reports.append({'file':name,'sourceSize':src.size,'sourceForegroundBounds':bbox,
        'size':out.size,'alphaBounds':out.getbbox(),'transparentPixels':int((aa==0).sum()),
        'semiTransparentPixels':int(((aa>0)&(aa<255)).sum()),
        'opaquePixels':int((aa==255).sum()),'placement':[left,top,cropped.width,cropped.height],
        'method':'neutral-bright edge-connected floodfill; one-pixel source erosion and 0.35px feather; aspect-preserving foreground fit'})
(HERE/'07-qa.json').write_text(json.dumps(reports,indent=2)+'\n',encoding='utf-8')
print(json.dumps(reports,indent=2))
