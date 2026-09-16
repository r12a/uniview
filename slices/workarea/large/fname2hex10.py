import os, string, glob, sys, shutil

if len(sys.argv) > 1:
    hexOfFirst = sys.argv[1]
else:
    print('Hex number of first character:')
    hexOfFirst = sys.stdin.readline()[:-1]

# 1. Copy images → output
image_files = glob.glob('images/*.png')
for src in image_files:
    dst = os.path.join('output', os.path.basename(src))
    shutil.copy(src, dst)

# 2. Now work only inside output/
filenames = glob.glob('output/*.png')

# Fix 12‑character names
for filename in filenames:
    base = os.path.basename(filename)
    if len(base) == 12:
        correctedname = base[:6] + '0' + base[6:]
        os.rename(filename, os.path.join('output', correctedname))

# 3. Rename everything using hex numbers
filenames = sorted(glob.glob('output/*.png'))

decnum = int(hexOfFirst, 16)
col = 0
row = 0

for filename in filenames:
    if col == 10:
        col = 0
        row += 1

    increment = col * 16
    hexnum = hex(decnum + row + increment)[2:].upper()

    # pad to 4 chars
    hexnum = hexnum.zfill(4)

    newname = os.path.join('output', hexnum + '.png')
    print(filename, ' becomes ', newname)

    os.rename(filename, newname)

    col += 1
    print(decnum)
