import os, string, glob, sys, shutil

if len(sys.argv) > 1:
    hexOfFirst = sys.argv[1];
else:
    print('Hex number of first character:')
    hexOfFirst = sys.stdin.readline()[:-1];


# 1. Copy images → output
image_files = glob.glob('images/*.png')
for src in image_files:
    dst = os.path.join('output', os.path.basename(src))
    shutil.copy(src, dst)

# 2. Now work only inside output/
filenames = glob.glob('output/*.png')

# Make filenames same length so they can be sorted
for filename in filenames:
    base = os.path.basename(filename)

    # Strip prefix and extension
    prefix = 'largenarrow_'
    number = base[len(prefix):-4]   # everything between prefix and ".png"

    # Normalise number length
    if len(number) == 1:
        number = '00' + number
    elif len(number) == 2:
        number = '0' + number
    # len == 3 → leave unchanged

    correctedname = prefix + number + '.png'
    correctedpath = os.path.join('output', correctedname)

    os.rename(filename, correctedpath)


# 3. Rename everything using hex numbers
filenames = sorted(glob.glob('output/*.png'))

decnum = int(hexOfFirst, 16)
col = 0
row = 0

for filename in filenames:
    if col == 8:
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
