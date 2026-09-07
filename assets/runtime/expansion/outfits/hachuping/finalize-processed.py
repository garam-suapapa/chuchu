"""Finalize catalog after manual contact-sheet approval; validate immutable sources."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[4]
OUT=BASE/'processed'
original_validation=json.loads((BASE/'validation.json').read_text())
for rec in original_validation['files']:
 p=ROOT/rec['path']
 assert hashlib.sha256(p.read_bytes()).hexdigest()==rec['sha256'],p
snapshot=BASE/'source-catalog.json'
if not snapshot.exists():snapshot.write_bytes((BASE/'catalog.json').read_bytes())
catalog=json.loads(snapshot.read_text(encoding='utf-8'))
qa=json.loads((OUT/'qa.json').read_text())
checks=[]
for item in catalog:
 category=item['category']
 for field,kind in [('sprite','sprite'),('wornSprite','worn')]:
  p=OUT/category/(kind+'.png')
  im=Image.open(p)
  assert im.mode=='RGBA'
  a=np.asarray(im)[:,:,3]
  assert a.min()==0 and a.max()==255
  assert np.all(a[0]==0) and np.all(a[-1]==0) and np.all(a[:,0]==0) and np.all(a[:,-1]==0)
  expected=(600,700) if kind=='worn' else (512,512)
  assert im.size==expected
  y,x=np.where(a>128)
  bounds=[int(x.min()),int(y.min()),int(x.max()+1),int(y.max()+1)]
  if kind=='worn':
   assert abs(bounds[1]-27)<=2 and abs(bounds[3]-661)<=2,bounds
  item[field]=str(p.relative_to(ROOT)).replace('\\','/')
  checks.append({'path':item[field],'dimensions':list(im.size),'alpha128Bounds':bounds,'edgePixelsTransparent':True,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
 item.update(width=512,height=512,wornWidth=600,wornHeight=700,hasAlpha=True,runtimeReady=True,status='processed-review')
 item['sourceSprite']='assets/runtime/expansion/outfits/hachuping/'+category+'/sprite.png'
 item['sourceWornSprite']='assets/runtime/expansion/outfits/hachuping/'+category+'/worn.png'
 item['review']['limitation']='Source-generation facial proportions vary slightly. Manual contrast-background review passed; alpha and canvas conversion complete. Raw sources and historic alpha failures are preserved.'
 item['review']['processedReview']='8 PNGs reviewed on dark teal and orange contact sheet; no visible checkerboard residue, body clipping, missing highlights, or hand/body artifacts in selection sprites.'
 (OUT/category/'metadata.json').write_text(json.dumps(item,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(BASE/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
qa.update(sourceHashCheck='8/8 unchanged against pre-processing validation.json',runtimeReadyPngCount=8,manualContrastReview='passed',checks=checks)
(OUT/'qa.json').write_text(json.dumps(qa,indent=2)+'\n')
print(json.dumps(checks,indent=2))
