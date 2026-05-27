import struct, zlib

def write_png(filename, pixels, size):
    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    raw = b''
    for row in pixels:
        raw += b'\x00'
        for r, g, b, a in row:
            raw += bytes([r, g, b, a])
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', ihdr)
    png += chunk(b'IDAT', zlib.compress(raw))
    png += chunk(b'IEND', b'')
    with open(filename, 'wb') as f:
        f.write(png)

def in_shield(px, py, size):
    x = px / size
    y = py / size
    pad = 0.12
    l, r = pad, 1 - pad
    top, mid = pad, 0.58
    cx = (l + r) / 2
    hw = (r - l) / 2
    if l <= x <= r and top <= y <= mid:
        return True
    if mid < y <= 1 - pad:
        prog = (y - mid) / (1 - pad - mid)
        w = hw * (1 - prog)
        if cx - w <= x <= cx + w:
            return True
    return False

def in_shield_inner(px, py, size):
    """Slightly smaller shield for highlight effect"""
    x = px / size
    y = py / size
    pad = 0.18
    l, r = pad, 1 - pad
    top, mid = pad, 0.56
    cx = (l + r) / 2
    hw = (r - l) / 2
    if l <= x <= r and top <= y <= mid:
        return True
    if mid < y <= 1 - pad - 0.02:
        prog = (y - mid) / (1 - pad - 0.02 - mid)
        w = hw * (1 - prog)
        if cx - w <= x <= cx + w:
            return True
    return False

def create_icon(size):
    # Colors
    bg = (99, 102, 241, 255)      # indigo-500
    inner = (129, 140, 248, 255)   # indigo-400 (lighter)
    transparent = (0, 0, 0, 0)

    # P letter in center
    def in_letter_p(px, py, s):
        x = px / s
        y = py / s
        # Vertical bar of P
        if 0.35 <= x <= 0.44 and 0.28 <= y <= 0.72:
            return True
        # Top bump of P
        if 0.44 <= x <= 0.62 and 0.28 <= y <= 0.50:
            # Simple rectangle for bump
            return True
        return False

    pixels = []
    for y in range(size):
        row = []
        for x in range(size):
            if in_shield(x, y, size):
                if in_letter_p(x, y, size):
                    row.append((255, 255, 255, 230))
                else:
                    row.append(bg)
            else:
                row.append(transparent)
        pixels.append(row)
    return pixels

for size, fname in [(16, 'icon16.png'), (48, 'icon48.png'), (128, 'icon128.png')]:
    write_png(f'/home/claude/popshield/{fname}', create_icon(size), size)
    print(f"Created {fname}")
