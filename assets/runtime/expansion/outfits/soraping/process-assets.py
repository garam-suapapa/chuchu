"""User-authorized local extraction; original PNGs are read-only inputs."""
from pathlib import Path
import json, hashlib
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'processed'
OUT.mkdir(exist_ok=True)
REPO=ROOT.parents[4]
REF=REPO/'assets/runtime/reference-wearables/soraping/soraping_outfit_01-v12/worn.png'

def flood_background(rgb):
    p=np.asarray(rgb).astype(np.int16)
    h,w=p.shape[:2]
    # Neutral light checker pixels, only those connected to empty outer space.
    candidate=(p.max(2)-p.min(2)<7)&(p.min(2)>215)
    # Seal tiny breaks in pale outlines before exterior flood; protect white fur.
    candidate=~ndimage.binary_closing(~candidate,iterations=7)
    seed=np.zeros((h,w),dtype=bool)
    seed[0]=candidate[0];seed[-1]=candidate[-1]
    seed[:,0]=candidate[:,0];seed[:,-1]=candidate[:,-1]
    bg=ndimage.binary_propagation(seed,mask=candidate)
    # A one-pixel feather lies inside the subject, avoiding checkerboard fringe.
    mask=Image.fromarray(np.where(bg,0,255).astype(np.uint8))
    inner=mask.filter(ImageFilter.MinFilter(3))
    alpha=np.minimum(np.asarray(mask),np.asarray(inner.filter(ImageFilter.GaussianBlur(.55))))
    rgba=rgb.convert('RGBA');rgba.putalpha(Image.fromarray(alpha))
    return rgba

def main():
    ref=Image.open(REF).convert('RGBA')
    rb=ref.getchannel('A').point(lambda x:255 if x>=8 else 0).getbbox()
    report=[]
    for source in sorted(ROOT.glob('soraping_outfit_*.png')):
        rgba=flood_background(Image.open(source).convert('RGB'))
        bounds=rgba.getchannel('A').getbbox()
        cropped=rgba.crop(bounds)
        worn='-worn' in source.stem
        if worn:
            size=(600,700)
            # Match reference's real alpha top and bottom; center at alpha midpoint.
            scale=(rb[3]-rb[1])/cropped.height
            target=(round(cropped.width*scale),rb[3]-rb[1])
            pos=(round((rb[0]+rb[2]-target[0])/2),rb[1])
        else:
            size=(600,600)
            scale=min(560/cropped.width,560/cropped.height)
            target=(round(cropped.width*scale),round(cropped.height*scale))
            pos=((600-target[0])//2,(600-target[1])//2)
        canvas=Image.new('RGBA',size)
        canvas.alpha_composite(cropped.resize(target,Image.Resampling.LANCZOS),pos)
        dest=OUT/source.name
        canvas.save(dest)
        a=np.asarray(canvas.getchannel('A'))
        report.append({'file':source.name,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'width':size[0],'height':size[1],'sourceBounds':bounds,'alphaBounds':canvas.getchannel('A').getbbox(),'referenceBounds':rb if worn else None,'placement':pos,'scale':scale,'transparentPixels':int((a==0).sum()),'opaquePixels':int((a==255).sum()),'partialAlphaPixels':int(((a>0)&(a<255)).sum()),'edgeAlphaMax':int(max(a[0].max(),a[-1].max(),a[:,0].max(),a[:,-1].max()))})
    (OUT/'qa.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    for background,label in [('#263847','dark'),('#ea8739','orange')]:
        sheet=Image.new('RGB',(2400,1400),background)
        draw=ImageDraw.Draw(sheet)
        for i,row in enumerate(report):
            pic=Image.open(OUT/row['file'])
            # rows: four worn above, four selections below
            n=int(row['file'].split('_')[-1].split('-')[0].split('.')[0])-7
            y=20 if '-worn' in row['file'] else 780
            x=n*600+(600-pic.width)//2
            sheet.paste(pic,(x,y),pic)
            draw.text((n*600+10,y-15),row['file'],fill='white')
        sheet.save(OUT/f'contact-{label}.jpg',quality=94)
    print(json.dumps(report,indent=2))

if __name__=='__main__':main()
