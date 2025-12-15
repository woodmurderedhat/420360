#!/usr/bin/env python3
from pathlib import Path

root = Path('.').resolve()

# Fix rule: files in golden-dawn/pages/*/ (i.e., deeper than pages) that link to '../index.html' should use '../../index.html'
changed = []
for p in root.glob('esoteric/golden-dawn/pages/*/*.html'):
    s = p.read_text(encoding='utf-8')
    if 'href="../index.html"' in s:
        s2 = s.replace('href="../index.html"', 'href="../../index.html"')
        p.write_text(s2, encoding='utf-8')
        changed.append(str(p))

# Keepers story pages
for p in root.glob('esoteric/keepers-of-the-flame/pages/stories/*.html'):
    s = p.read_text(encoding='utf-8')
    if 'href="../index.html"' in s:
        s2 = s.replace('href="../index.html"', 'href="../../index.html"')
        p.write_text(s2, encoding='utf-8')
        changed.append(str(p))

if changed:
    print('Updated files:')
    for c in changed:
        print(' -', c)
else:
    print('No changes made.')
