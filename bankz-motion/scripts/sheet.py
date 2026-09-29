# Hoja de contacto: python3 scripts/sheet.py out.png cols img1 img2 ...
import sys
from PIL import Image, ImageDraw
out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
ims = [Image.open(f).convert('RGB') for f in files]
w, h = ims[0].size
scale = 640 / w if w > h else 360 / w
tw, th = int(w * scale), int(h * scale)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 8), rows * (th + 28)), (128, 128, 128))
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = (i % cols) * (tw + 8), (i // cols) * (th + 28)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + 24))
    d.text((x + 4, y + 6), f.split('-')[-1].split('.')[0], fill=(255, 0, 0))
sheet.save(out)
