"""Reproduce approved local checkerboard removal and alpha-bound-aware framing.
Requires Python, Pillow, numpy, scipy. Run from any working directory.
Only reads original PNGs; all edited images go to processed/.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'processed'
OUT.mkdir(exist_ok=True)
REPO = ROOT.parents[4]
REF = REPO / 'assets/runtime/reference-wearables/challangping/challangping_outfit_01-v12/worn.png'

def bounds(mask):
    yy, xx = np.where(mask)
    return [int(xx.min()), int(yy.min()), int(xx.max()+1), int(yy.max()+1)]

ref_alpha = np.array(Image.open(REF).convert('RGBA'))[:, :, 3]
labels, _ = ndi.label(ref_alpha > 128)
sizes = np.bincount(labels.ravel()); sizes[0] = 0
ref_box = bounds(labels == sizes.argmax())

def extract(path):
    rgb = np.array(Image.open(path).convert('RGB'))
    mn, mx = rgb.min(axis=2), rgb.max(axis=2)
    eligible = (mn >= 210) & ((mx.astype(int)-mn.astype(int)) <= 16)
    if path.name == '10-worn.png':
        # Source-reviewed pale left ear has a low-chroma outer contour. A tighter
        # neutral threshold in its bounding region preserves the real contour.
        eligible[340:570,190:350] = ((mn >= 235) & ((mx.astype(int)-mn.astype(int)) <= 6))[340:570,190:350]
    seeds = np.zeros(eligible.shape, bool)
    seeds[0,:] = eligible[0,:]; seeds[-1,:] = eligible[-1,:]
    seeds[:,0] = eligible[:,0]; seeds[:,-1] = eligible[:,-1]
    # Source-reviewed enclosed leg gaps: soles or coat hems may isolate background
    # from the outer canvas. These seeds are in background, never in anatomy.
    gap_seeds={'07-worn.png':[(579,1250)],'08-worn.png':[(558,1140),(565,1220)],'09-worn.png':[(582,1160)],'10-worn.png':[(577,1100)]}
    for x,y in gap_seeds.get(path.name,[]):
        if eligible[y,x]: seeds[y,x]=True
    bg = ndi.binary_propagation(seeds, mask=eligible)
    fg = ~bg
    labels, _ = ndi.label(fg)
    sizes = np.bincount(labels.ravel()); sizes[0] = 0
    fg = sizes[labels] >= 90
    # Subpixel-sized inward alpha transition avoids a hard white cutout fringe.
    dist = ndi.distance_transform_edt(fg)
    alpha = np.clip((dist - .55) / 1.2, 0, 1)
    rgba = np.dstack([rgb, np.round(alpha*255).astype('uint8')])
    rgba[rgba[:,:,3] == 0, :3] = 0
    return Image.fromarray(rgba), bounds(alpha > .5)

qa = {'status':'processed-review','method':'border-connected high-value neutral checkerboard segmentation plus source-reviewed enclosed leg-gap seeds; tighter left-ear threshold for winter; internal whites protected by connectivity; 90-pixel component minimum; 1.2px inward alpha transition', 'referenceVisibleBounds':ref_box,'files':[]}
panels = []
for num in ['07','08','09','10']:
    row=[]
    for kind in ['worn','sprite']:
        filename=f'{num}-{kind}.png'
        cut, box=extract(ROOT / filename)
        crop=cut.crop(box)
        if kind == 'worn':
            # Match reference hair-top and sole height; preserve source aspect ratio.
            target_height=ref_box[3]-ref_box[1]
            scale=target_height/crop.height
            target=(round(crop.width*scale), target_height)
            canvas=Image.new('RGBA',(600,700))
            pos=(round((ref_box[0]+ref_box[2]-target[0])/2), ref_box[1])
        else:
            scale=min(464/crop.width,464/crop.height)
            target=(round(crop.width*scale),round(crop.height*scale))
            canvas=Image.new('RGBA',(512,512))
            pos=((512-target[0])//2,(512-target[1])//2)
        canvas.alpha_composite(crop.resize(target,Image.Resampling.LANCZOS),pos)
        canvas.save(OUT/filename)
        a=np.array(canvas)[:,:,3]
        qa['files'].append({'file':filename,'sourceBounds':box,'size':list(canvas.size),'visibleBounds':bounds(a>128),'transparentPixels':int((a==0).sum()),'partialAlphaPixels':int(((a>0)&(a<255)).sum()),'touchesCanvasEdge':bool((a[0,:]>0).any() or (a[-1,:]>0).any() or (a[:,0]>0).any() or (a[:,-1]>0).any())})
        for color in ['#203048','#ff42bd']:
            panel=Image.new('RGBA',canvas.size,color); panel.alpha_composite(canvas)
            panel=panel.convert('RGB'); panel.thumbnail((300,350))
            cell=Image.new('RGB',(310,380),'#eeeeee');cell.paste(panel,((310-panel.width)//2,25))
            ImageDraw.Draw(cell).text((8,5),f'{num} {kind} {color}',fill='black');row.append(cell)
    panels.append(row)
sheet=Image.new('RGB',(1240,1520),'white')
for y,row in enumerate(panels):
    for x,panel in enumerate(row):sheet.paste(panel,(x*310,y*380))
sheet.save(OUT/'contact-sheet.png')
(OUT/'qa.json').write_text(json.dumps(qa,indent=2)+'\n',encoding='utf8')
catalog=json.loads((ROOT/'catalog.json').read_text(encoding='utf8'))
prefix='assets/runtime/expansion/outfits/challangping'
for entry in catalog:
    num=entry['id'][-2:]
    entry.update(sprite=f'{prefix}/processed/{num}-sprite.png',wornSprite=f'{prefix}/processed/{num}-worn.png',width=512,height=512,pngColorType=6,wornSize={'width':600,'height':700,'pngColorType':6},runtimeReady=True,status='processed-review',productionStatus='processed-review',processingQA=f'{prefix}/processed/qa.json')
(ROOT/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(qa,indent=2))
