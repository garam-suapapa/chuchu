"""Approved local alpha extraction; preserve original generated RGB PNG files."""
from pathlib import Path
import json
import hashlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

def connected_background(candidate):
    # Pad so one flood-fill seed reaches all four image edges.
    h, w = candidate.shape
    mask = Image.new('L', (w+2, h+2), 255)
    mask.paste(Image.fromarray(candidate.astype('uint8')*255), (1,1))
    ImageDraw.floodfill(mask, (0,0), 128, thresh=0)
    return np.asarray(mask)[1:-1,1:-1] == 128

def extract(name, worn):
    source = ROOT / (name+'.png')
    original = Image.open(source).convert('RGB')
    rgb = np.asarray(original).astype(np.int16)
    # The synthetic checkerboard is neutral and bright; cream trim is warm.
    spread = rgb.max(2)-rgb.min(2)
    candidate = (rgb.min(2)>226) & (spread<14) & ((rgb[:,:,0]-rgb[:,:,2])<5)
    background = connected_background(candidate)
    if worn:
        # Image-specific open negative space: antialiasing closes the very
        # narrow leg gap at source resolution, disconnecting some gray cells
        # from the exterior. This bounded region excludes the ivory hem.
        gap = (rgb.min(2)>215) & (spread<30) & (np.abs(rgb[:,:,0]-rgb[:,:,2])<15)
        background[1152:1299,580:618] |= gap[1152:1299,580:618]
    alpha = Image.fromarray((~background).astype('uint8')*255)
    # Suppress isolated background leftovers, keeping the principal silhouette.
    # Interior highlights are never keyed out because only edge-connected pixels
    # were removed. The open gap between the feet is edge-connected as well.
    alpha = alpha.filter(ImageFilter.MedianFilter(3))
    if worn:
        # Preserve subpixel transparency in the narrow slit after the median
        # cleanup; unmatte its pale edge pixels against the known light backdrop.
        aa=np.array(alpha).astype(np.float32)/255
        local=np.zeros(aa.shape,dtype=bool);local[1145:1299,580:618]=True
        local &= rgb.min(2)>180
        coverage=np.clip((spread.astype(np.float32)-12)/35,0,1)
        aa[local]=np.minimum(aa[local],coverage[local])
        partial=local & (aa>0) & (aa<1)
        corrected=rgb.astype(np.float32)
        corrected[partial]=(corrected[partial]-(1-aa[partial,None])*248)/aa[partial,None]
        original=Image.fromarray(np.clip(corrected,0,255).astype('uint8'))
        alpha=Image.fromarray((aa*255).astype('uint8'))
    rgba = original.convert('RGBA'); rgba.putalpha(alpha)
    bbox = alpha.point(lambda x: 255 if x>8 else 0).getbbox()
    cropped=rgba.crop(bbox)
    if worn:
        size=(600,700); target=(503,650); anchor=(48,21)
    else:
        size=(512,512); target=(472,472); anchor=(20,20)
    scale=min(target[0]/cropped.width,target[1]/cropped.height)
    scaled=cropped.resize((round(cropped.width*scale),round(cropped.height*scale)),Image.Resampling.LANCZOS)
    output=Image.new('RGBA',size,(0,0,0,0))
    pos=(anchor[0]+(target[0]-scaled.width)//2,anchor[1]+(target[1]-scaled.height)//2)
    output.alpha_composite(scaled,pos)
    output.save(HERE/(name+'.png'))
    oa=np.asarray(output.getchannel('A'))
    obox=output.getchannel('A').point(lambda x:255 if x>8 else 0).getbbox()
    return output, {'file':name+'.png','mode':'RGBA','sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'sourceSize':list(original.size),'sourceCrop':list(bbox),'size':list(size),'alphaBBoxThreshold8':list(obox),'alphaZeroPixels':int((oa==0).sum()),'alphaPartialPixels':int(((oa>0)&(oa<255)).sum()),'opaquePixels':int((oa==255).sum()),'edgeAlphaMax':int(max(oa[0].max(),oa[-1].max(),oa[:,0].max(),oa[:,-1].max()))}

def main():
    HERE.mkdir(exist_ok=True)
    records=[]
    for worn in (True,False):
        name='bangulping_outfit_10'+('-worn' if worn else '')
        output,record=extract(name,worn);records.append(record)
        swatches=[('#182638','navy'),('#d654ae','magenta'),('#8cc86e','green')]
        qa=Image.new('RGB',(output.width*3,output.height),'white')
        for i,(color,_) in enumerate(swatches):
            panel=Image.new('RGBA',output.size,color);panel.alpha_composite(output)
            qa.paste(panel.convert('RGB'),(i*output.width,0))
        qa.save(HERE/('10-qa-'+('worn' if worn else 'sprite')+'.png'))
        if worn:
            output.crop((285,590,332,675)).resize((282,510)).save(HERE/'10-qa-legs-detail.png')
    (HERE/'10-qa.json').write_text(json.dumps({'method':'edge-connected neutral checkerboard extraction; warm ivory protection; alpha-aware Lanczos fit','assets':records},indent=2),encoding='utf-8')
    print(json.dumps(records,indent=2))

if __name__=='__main__':main()
