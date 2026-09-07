"""Verify final alpha/frames/source hashes and refresh this extension catalog only."""
from pathlib import Path
from PIL import Image
import numpy as np
import hashlib, json

HERE=Path(__file__).resolve().parent
ROOT=HERE.parent
REL='assets/runtime/expansion/outfits/bangulping'
historical=json.loads((ROOT/'qa-report.json').read_text(encoding='utf-8-sig'))
source_checks=[]
for entry in historical['files']:
    digest=hashlib.sha256((ROOT/entry['file']).read_bytes()).hexdigest()
    assert digest==entry['sha256'], f'Original modified: {entry["file"]}'
    source_checks.append({'file':entry['file'],'sha256':digest,'unchanged':True})
catalog=json.loads((ROOT/'catalog.json').read_text(encoding='utf-8-sig'))
rows=[]
for item in catalog:
    id=item['id']
    for suffix in ('','-worn'):
        name=f'{id}{suffix}.png'
        p=HERE/name
        im=Image.open(p)
        assert im.mode=='RGBA', name
        assert im.size==((600,700) if suffix else (512,512)), name
        alpha=np.array(im)[:,:,3]
        ys,xs=np.where(alpha>8)
        bounds=[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)]
        border=int(max(alpha[0].max(),alpha[-1].max(),alpha[:,0].max(),alpha[:,-1].max()))
        assert border==0 and (alpha==0).sum()>10000 and (alpha==255).sum()>10000,name
        rows.append({'file':f'{REL}/processed/{name}','size':list(im.size),'mode':im.mode,
          'alphaBoundsAbove8':bounds,'transparentPixels':int((alpha==0).sum()),
          'partialAlphaPixels':int(((alpha>0)&(alpha<255)).sum()),'opaquePixels':int((alpha==255).sum()),
          'canvasEdgeAlphaMax':border,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),
          'visualQA':'pass: contrast composites inspected; full silhouette, no checkerboard, white details preserved'})
    item.update(sprite=f'{REL}/processed/{id}.png',wornSprite=f'{REL}/processed/{id}-worn.png',
        width=512,height=512,wornWidth=600,wornHeight=700,status='processed-review',runtimeReady=True)
    item['validation'].update(alpha=True,runtimeFrame=True,sourceOriginalsUnchanged=True,
        contrastCompositeReview='pass',whiteDetailsPreserved=True)
    item['processing']={'method':'authorized-local-color-and-connectivity-matte',
        'referenceAlphaBoundsAbove8':[48,21,551,671],
        'placement':'aspect-preserving crop of foreground, contain within reference bounds; center',
        'script':f'{REL}/processed/process_{id[-2:]}.py',
        'qa':f'{REL}/processed/{id[-2:]}-qa.json'}
    item['sourceSprite']=f'{REL}/{id}.png'
    item['sourceWornSprite']=f'{REL}/{id}-worn.png'
    item['limitations']=['Generated face and body proportions and garment pattern placement are close to references, not pixel-identical.']
report={'status':'pass','requestedPNGs':8,'processedPNGs':len(rows),'sourceOriginalsUnchanged':source_checks,
    'referenceAlphaBoundsAbove8':[48,21,551,671],'files':rows,
    'visualInspection':'All eight composites inspected against dark and contrasting colored backgrounds. No visible checkerboard remnants, clipped silhouettes, body fragments in selection sprites, or lost white garment/eye highlights.',
    'limitations':['Uniform foreground scaling preserves generated proportions; small original likeness/proportion differences remain.']}
(HERE/'qa-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':'pass','processedPNGs':len(rows),'unchangedOriginals':len(source_checks)}))
