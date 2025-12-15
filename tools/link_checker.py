#!/usr/bin/env python3
"""Simple static site link checker
Usage: python tools/link_checker.py [--root PATH]

Checks internal links and asset references across HTML files and reports missing targets.
"""
import os
import sys
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, urljoin

class LinkExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag == 'link' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag == 'script' and 'src' in attrs:
            self.links.append(attrs['src'])
        if tag == 'img' and 'src' in attrs:
            self.links.append(attrs['src'])
        if tag in ('audio','video','source','iframe') and 'src' in attrs:
            self.links.append(attrs['src'])
        # svg/use xlink:href sometimes used
        if tag == 'use' and 'xlink:href' in attrs:
            self.links.append(attrs['xlink:href'])


def is_external(url):
    if not url: return True
    u = url.strip()
    if u.startswith('#'): return True
    u = u.lower()
    return u.startswith('http:') or u.startswith('https:') or u.startswith('mailto:') or u.startswith('tel:') or u.startswith('javascript:') or u.startswith('//') or u.startswith('data:')


def resolve_target(root: Path, source_file: Path, link: str) -> Path:
    # Strip query and fragment
    parsed = urlparse(link)
    path = parsed.path
    if path == '':
        # fragment-only or empty
        return source_file
    if path.startswith('/'):
        # absolute path - resolve relative to root
        candidate = root.joinpath(path.lstrip('/'))
    else:
        candidate = (source_file.parent / path).resolve()
    return candidate


def check_site(root: Path):
    html_files = list(root.rglob('*.html'))
    broken = []
    checked = 0
    for html in html_files:
        try:
            text = html.read_text(encoding='utf-8')
        except Exception:
            try:
                text = html.read_text(encoding='latin-1')
            except Exception as e:
                print(f"Failed reading {html}: {e}")
                continue
        parser = LinkExtractor()
        parser.feed(text)
        for link in parser.links:
            checked += 1
            if is_external(link):
                continue
            target = resolve_target(root, html, link)
            # Some URLs may point to directories; accept directory/index.html
            if target.is_dir():
                if (target / 'index.html').exists():
                    continue
            # If link has a fragment only (link to anchor in same file), it's fine
            if target == html and urlparse(link).fragment:
                continue
            if not target.exists():
                broken.append((str(html.relative_to(root)), link, str(target.relative_to(root) if target.exists() or target.is_absolute() else target)))
    return html_files, checked, broken


def main():
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument('--root', default='.', help='Root folder to scan')
    args = p.parse_args()
    root = Path(args.root).resolve()
    print(f"Scanning HTML files under: {root}")
    html_files, checked, broken = check_site(root)
    print(f"Found {len(html_files)} HTML files; inspected {checked} link refs")
    if not broken:
        print("No missing internal targets found.")
        return 0
    print("Broken links found:")
    for source, link, target in broken:
        print(f" - {source} -> {link}  (resolved: {target})")
    return 1

if __name__ == '__main__':
    sys.exit(main())
