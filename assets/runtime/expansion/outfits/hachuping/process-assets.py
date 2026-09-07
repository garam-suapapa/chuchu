"""Reproduce Hachuping alpha extraction and placement. Requires Pillow, numpy, scipy.
Run from the repository root. Original PNGs are never modified.
"""
from pathlib import Path
import json, hashlib
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from scipy.spatial import ConvexHull

ROOT=Path(__file__).resolve().parents[5]
BASE=Path(__file__).resolve().parent
OUT=BASE/'processed'
OUT.mkdir(exist_ok=True)
CATEGORIES=['pajamas','raincoat','swimwear','winter']
REF=ROOT/'assets/runtime/reference-wearables/hachuping/hachuping_outfit_01-v12/worn.png'

def clean(rgb,category,kind):
    arr=np.asarray(rgb.convert('RGB')).astype(float)
    spread=arr.max(2)-arr.min(2)
    neutral=(spread<8)&(arr.min(2)>175)
    labels,n=ndi.label(neutral)
    ids=np.unique(np.r_[labels[0],labels[-1],labels[:,0],labels[:,-1]])
    bg=np.isin(labels,ids[ids>0])
    foreground=~bg
    # Read-only source review identifies these enclosed neutral pockets as leg gaps,
    # not fabric/eye highlights. Remove only their neutral connected components.
    if kind=='worn':
        for label in range(1,n+1):
            yy,xx=np.where(labels==label)
            if len(xx)>100 and xx.min()>550 and xx.max()<590 and yy.min()>1000:
                foreground[labels==label]=False
    # The swimwear source's upper-left ear has a nearly neutral white highlight
    # connected to the edge. Reconstruct only its convex alpha contour from the
    # preserved surrounding silhouette; keep the original RGB ear pixels.
    if category=='swimwear' and kind=='worn':
        x0,y0,x1,y1=205,70,425,280
        region=foreground[y0:y1,x0:x1]
        yy,xx=np.where(region)
        points=np.c_[xx,yy]
        hull=ConvexHull(points)
        mask=Image.new('1',(x1-x0,y1-y0))
        ImageDraw.Draw(mask).polygon([tuple(p) for p in points[hull.vertices]],fill=1)
        foreground[y0:y1,x0:x1] |= np.asarray(mask)
    # Remove isolated edge/background dust, preserving separate garments/shoes.
    comps,n=ndi.label(foreground)
    counts=np.bincount(comps.ravel())
    foreground &= counts[comps]>100
    # Neutral holes remain opaque, protecting pupils' white glints and fabric highlights.
    holes=[]
    for label in range(1,int(labels.max())+1):
        if label in ids or not np.any(foreground[labels==label]): continue
        yy,xx=np.where(labels==label)
        if len(xx)>100: holes.append([len(xx),int(xx.min()),int(yy.min()),int(xx.max()),int(yy.max())])
    alpha=ndi.gaussian_filter(foreground.astype(float),0.55)
    alpha[alpha<0.02]=0
    alpha[alpha>0.98]=1
    # Decontaminate only partially transparent boundary pixels with closest inner color.
    core=ndi.binary_erosion(foreground,iterations=2)
    _,nearest=ndi.distance_transform_edt(~core,return_indices=True)
    boundary=(alpha>0)&(~core)
    arr[boundary]=arr[nearest[0][boundary],nearest[1][boundary]]
    rgba=np.dstack([np.clip(arr,0,255).astype(np.uint8),np.rint(alpha*255).astype(np.uint8)])
    return Image.fromarray(rgba),holes

ref=np.asarray(Image.open(REF).convert('RGBA'))
ref_mask=ref[:,:,3]>128
yy,xx=np.where(ref_mask)
refbox=[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)]
# Ignore alpha dust from the old reference; match visible crown and feet, preserve aspect.
target_top=refbox[1]
target_bottom=refbox[3]
target_center=(refbox[0]+refbox[2])/2

report={'reference':str(REF.relative_to(ROOT)).replace('\\','/'),'referenceAlpha128Bounds':refbox,'method':'Neutral bright border-connected background flood; preserve enclosed highlights; dust removal; subpixel edge feather and edge RGB decontamination; proportional alpha-bounds placement.','files':[]}
for category in CATEGORIES:
    d=OUT/category
    d.mkdir(exist_ok=True)
    for kind in ['worn','sprite']:
        source=BASE/category/(kind+'.png')
        im=Image.open(source)
        rgba,holes=clean(im,category,kind)
        bbox=rgba.getbbox()
        crop=rgba.crop(bbox)
        if kind=='worn':
            scale=(target_bottom-target_top)/crop.height
            size=(round(crop.width*scale),target_bottom-target_top)
            if size[0]>540: raise ValueError('Character too wide for frame')
            result=Image.new('RGBA',(600,700))
            result.alpha_composite(crop.resize(size,Image.Resampling.LANCZOS),(round(target_center-size[0]/2),target_top))
        else:
            scale=min(472/crop.width,472/crop.height)
            size=(round(crop.width*scale),round(crop.height*scale))
            result=Image.new('RGBA',(512,512))
            result.alpha_composite(crop.resize(size,Image.Resampling.LANCZOS),((512-size[0])//2,(512-size[1])//2))
        dest=d/(kind+'.png')
        result.save(dest)
        a=np.asarray(result)[:,:,3]
        record={'path':str(dest.relative_to(ROOT)).replace('\\','/'),'source':str(source.relative_to(ROOT)).replace('\\','/'),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'size':list(result.size),'sourceAlphaBounds':list(bbox),'alphaBounds':list(result.getbbox()),'alphaMin':int(a.min()),'alphaMax':int(a.max()),'transparentPixels':int((a==0).sum()),'partialAlphaPixels':int(((a>0)&(a<255)).sum()),'enclosedNeutralComponentsOver100px':holes}
        report['files'].append(record)
        print(category,kind,'bbox',bbox,'holes',holes)

# Contact sheet on contrasting backgrounds. This is QA only, never a game sprite.
panels=[]
for category in CATEGORIES:
 for kind in ['worn','sprite']:
  img=Image.open(OUT/category/(kind+'.png'))
  thumb=img.copy();thumb.thumbnail((300,350),Image.Resampling.LANCZOS)
  panel=Image.new('RGB',(620,385),'#eeeeee')
  for idx,color in enumerate(['#163749','#e95b20']):
   bg=Image.new('RGBA',(300,350),color)
   bg.alpha_composite(thumb,((300-thumb.width)//2,(350-thumb.height)//2))
   panel.paste(bg.convert('RGB'),(idx*310,25))
  ImageDraw.Draw(panel).text((10,6),category+' / '+kind,fill='black')
  panels.append(panel)
sheet=Image.new('RGB',(1240,1540),'white')
for i,panel in enumerate(panels):sheet.paste(panel,((i%2)*620,(i//2)*385))
sheet.save(OUT/'contact-sheet.png')
(OUT/'qa.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
