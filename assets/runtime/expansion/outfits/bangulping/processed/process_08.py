"""Authorized local PNG cleanup; originals preserved. Requires Pillow and numpy."""
from pathlib import Path
from collections import deque
import json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

def remove_checker(image, worn=False):
    rgb = np.asarray(image.convert('RGB')).astype(np.int16)
    height, width, _ = rgb.shape
    # Only near-neutral light pixels reachable from the exterior are background.
    # The exterior flood leaves isolated white eye/specular highlights intact.
    candidate = (rgb.min(2) > 205) & ((rgb.max(2) - rgb.min(2)) < 19)
    background = np.zeros((height, width), dtype=bool)
    q = deque()
    def add(y,x):
        if candidate[y,x] and not background[y,x]:
            background[y,x] = True
            q.append((y,x))
    for x in range(width):
        add(0,x); add(height-1,x)
    for y in range(height):
        add(y,0); add(y,width-1)
    if worn:
        # The touching coat/boots enclose a background pocket between the legs.
        # Coordinates were verified on the original image, not inferred from skin.
        add(1140,607)
        add(1210,607)
    while q:
        y,x = q.popleft()
        if y: add(y-1,x)
        if y+1<height: add(y+1,x)
        if x: add(y,x-1)
        if x+1<width: add(y,x+1)
    mask = Image.fromarray((~background).astype(np.uint8)*255)
    # Subpixel edge smoothing, then suppress residual low-alpha exterior pixels.
    mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.55))
    alpha = np.asarray(mask).copy()
    alpha[alpha<5] = 0
    # Remove light matte from partially transparent edge samples only.
    a = alpha.astype(np.float32)/255
    output = rgb.astype(np.float32)
    edge = (a>0) & (a<1)
    output[edge] = np.clip((output[edge] - 245*(1-a[edge,None])) / a[edge,None], 0,255)
    rgba = np.dstack((output.astype(np.uint8),alpha))
    return Image.fromarray(rgba), int(background.sum())

def contain_subject(image, worn):
    alpha = np.asarray(image.getchannel('A'))
    ys,xs = np.where(alpha>8)
    bbox = (int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1))
    crop=image.crop(bbox)
    size=(600,700) if worn else (512,512)
    box=(48,21,551,671) if worn else (20,20,492,492)
    scale=min((box[2]-box[0])/crop.width,(box[3]-box[1])/crop.height)
    scaled=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.LANCZOS)
    dest=(round((box[0]+box[2]-scaled.width)/2),round((box[1]+box[3]-scaled.height)/2))
    canvas=Image.new('RGBA',size)
    canvas.alpha_composite(scaled,dest)
    return canvas,bbox

def contact(image,path):
    colors=['#172334','#f2b3d2','#46a47a','#ffffff']
    sheet=Image.new('RGB',(image.width*2,image.height*2))
    for i,color in enumerate(colors):
        cell=Image.new('RGBA',image.size,color)
        cell.alpha_composite(image)
        sheet.paste(cell.convert('RGB'),((i%2)*image.width,(i//2)*image.height))
    sheet.save(path)

def main():
    HERE.mkdir(parents=True,exist_ok=True)
    report=[]
    for suffix in ['-worn','']:
        name=f'bangulping_outfit_08{suffix}.png'
        original=Image.open(ROOT/name)
        cleaned,bg_count=remove_checker(original,bool(suffix))
        result,source_bbox=contain_subject(cleaned,bool(suffix))
        result.save(HERE/name)
        contact(result,HERE/f'08-qa{suffix or "-sprite"}.png')
        a=np.asarray(result.getchannel('A'))
        ys,xs=np.where(a>8)
        report.append({'file':name,'originalSize':list(original.size),'size':list(result.size),'mode':result.mode,'sourceSubjectBBox':source_bbox,'outputAlphaBBox':[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)],'transparentPixels':int((a==0).sum()),'partialAlphaPixels':int(((a>0)&(a<255)).sum()),'opaquePixels':int((a==255).sum()),'exteriorPixelsRemoved':bg_count,'edgeAlphaMax':int(max(a[0].max(),a[-1].max(),a[:,0].max(),a[:,-1].max()))})
    (HERE/'08-qa.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(report,indent=2))

if __name__=='__main__': main()
