from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage as ndi

root = Path(__file__).parent
for path in sorted(root.glob('*.png')):
    arr = np.array(Image.open(path).convert('RGB')).astype(float)
    low, high = arr.min(2), arr.max(2)
    bg = (low >= 242) & ((high - low) <= 8)
    labels, count = ndi.label(bg)
    sizes = np.bincount(labels.ravel())
    ids = np.argsort(sizes[1:])[-20:][::-1] + 1
    print(path.name)
    for i in ids:
        if sizes[i] < 150:
            continue
        ys, xs = np.where(labels == i)
        print(int(i), int(sizes[i]), (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())))
