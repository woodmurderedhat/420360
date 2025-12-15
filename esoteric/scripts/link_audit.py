#!/usr/bin/env python3
"""
Simple link checker for the 'esoteric' folder.
Finds local links (href/src) that point to missing files.
"""
import os
import re
import sys
from html.parser import HTMLParser

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        for k, v in attrs:
            if tag == 'a' and k == 'href':
                self.links.append(v)
            if tag == 'img' and k == 'src':
                self.links.append(v)
            if tag == 'script' and k == 'src':
                self.links.append(v)
            if tag == 'link' and k == 'href':
                self.links.append(v)


def is_external(url):
    return url.startswith('http:') or url.startswith('https:') or url.startswith('mailto:') or url.startswith('tel:')


def resolve_path(html_file, link):
    # Skip internal anchors and empty
    if not link or link.startswith('#') or link.startswith('mailto:') or link.startswith('tel:'):
        return None
    if is_external(link):
        return None
    # If link contains query or anchor, strip
    cleaned = link.split('#')[0].split('?')[0]
    # Absolute to repo root starting with '/'
    if cleaned.startswith('/'):
        return os.path.normpath(os.path.join(ROOT, cleaned.lstrip('/')))
    # Relative to html file's directory
    return os.path.normpath(os.path.join(os.path.dirname(html_file), cleaned))


def find_html_files(root):
    html_files = []
    for dirpath, _, filenames in os.walk(root):
        for f in filenames:
            if f.lower().endswith('.html'):
                html_files.append(os.path.join(dirpath, f))
    return html_files


def main():
    root = ROOT
    html_files = find_html_files(root)
    errors = []
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as fh:
            data = fh.read()
        parser = LinkParser()
        parser.feed(data)
        for link in parser.links:
            path = resolve_path(html_file, link)
            if path is None:
                continue
            # if path is directory, expect index.html
            if os.path.isdir(path):
                index_file = os.path.join(path, 'index.html')
                if not os.path.exists(index_file):
                    errors.append((html_file, link, index_file))
            else:
                if not os.path.exists(path):
                    errors.append((html_file, link, path))
    if not errors:
        print('No broken local links found in esoteric folder.')
        return 0
    print(f'Found {len(errors)} broken links:')
    for html_file, link, path in errors:
        print(f'File: {html_file}\n  Link: {link}\n  Resolved: {path}\n')
    return 1

if __name__ == '__main__':
    sys.exit(main())
