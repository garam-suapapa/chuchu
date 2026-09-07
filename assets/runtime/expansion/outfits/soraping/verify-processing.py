"""Verify immutable sources and the processed runtime assets."""
from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image

root=Path(__file__).resolve().parent
originals=json.loads((root/'inspection.json').read_text())
for row in originals:
    assert hashlib.sha256((root/row['file']).read_bytes()).hexdigest()==row['sha256'],row['file']
catalog=json.loads((root/'catalog.json').read_text(encoding='utf-8'))
assert len(catalog)==4
for outfit in catalog:
    assert outfit['runtimeReady'] is True
    assert outfit['productionTemplate']['status']=='processed-review'
    for key,size in [('sprite',(600,600)),('wornSprite',(600,700))]:
        file=root.parents[4]/outfit[key]
        im=Image.open(file)
        assert im.mode=='RGBA' and im.size==size,file
        a=np.asarray(im.getchannel('A'))
        assert (a==0).sum()>a.size//3 and (a==255).sum()>10000,file
        assert max(a[0].max(),a[-1].max(),a[:,0].max(),a[:,-1].max())==0,file
        if key=='wornSprite':
            assert im.getchannel('A').getbbox()[1::2]==(14,676),file
qa=json.loads((root/'processed/qa.json').read_text())
winter=next(x for x in qa if x['file']=='soraping_outfit_10.png')
im=Image.open(root/'processed'/winter['file'])
for x,y in [(470,210),(420,160),(820,175),(950,450),(780,120),(500,150)]:
    tx=round((x-winter['sourceBounds'][0])*winter['scale']+winter['placement'][0])
    ty=round((y-winter['sourceBounds'][1])*winter['scale']+winter['placement'][1])
    assert im.getpixel((tx,ty))[3]>=240,('white fur removed',x,y)
# Visually verified empty-background sample beside the left fur collar.
x,y=340,210
tx=round((x-winter['sourceBounds'][0])*winter['scale']+winter['placement'][0])
ty=round((y-winter['sourceBounds'][1])*winter['scale']+winter['placement'][1])
assert im.getpixel((tx,ty))[3]==0
print('PASS: 8 original SHA256 matches; 8 RGBA assets; 4 worn 600x700 / 4 selection 600x600; clear margins; reference y=14..676; 6 winter white-fur opacity samples preserved; adjacent background sample transparent.')
