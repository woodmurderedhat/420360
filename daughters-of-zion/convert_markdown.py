#!/usr/bin/env python3
"""
Convert markdown files from library-of-zion to styled HTML pages
"""

import os
import re
from pathlib import Path

# HTML template
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Library of Zion</title>
    <link rel="stylesheet" href="../styles/main.css">
    <link rel="stylesheet" href="../styles/navigation.css">
    <link rel="stylesheet" href="../styles/responsive.css">
</head>
<body>
    <nav id="main-nav">
        <div class="nav-container">
            <div class="logo">
                <span class="symbol">✦</span>
                <span class="title">Daughters of Zion</span>
            </div>
            <button class="mobile-menu-toggle" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="nav-links">
                <li><a href="../index.html">Home</a></li>
                <li><a href="../pages/about.html">About</a></li>
                <li><a href="../pages/history.html">History</a></li>
                <li><a href="../pages/seven-veils.html">Seven Veils</a></li>
                <li><a href="../pages/rituals.html">Rituals</a></li>
                <li><a href="../pages/hidden-names.html">Hidden Names</a></li>
                <li><a href="../pages/circle-mothers.html">Circle Mothers</a></li>
                <li><a href="../pages/library.html" class="active">Library</a></li>
            </ul>
        </div>
    </nav>

    <header class="page-header">
        <div class="container">
            <h1>{page_title}</h1>
            {subtitle}
        </div>
    </header>

    <main>
        <section class="content-section">
            <div class="content-wrapper">
                {content}
                
                <div style="margin-top: 4rem; padding-top: 2rem; border-top: 2px solid var(--accent-color); text-align: center;">
                    <a href="../pages/library.html" class="btn">← Back to Library</a>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2026 The Daughters of Zion Chronicle. A modern interpretation and documentation.</p>
            <p class="footer-note">This is a symbolic reconstruction based on scriptural echoes and historical research.</p>
            <p class="footer-note">Hosted by <a href="https://420360.xyz" target="_blank" style="color: var(--accent-color); text-decoration: none;">420360.xyz</a></p>
        </div>
    </footer>

    <script src="../scripts/navigation.js"></script>
    <script src="../scripts/main.js"></script>
</body>
</html>
"""

def convert_markdown_to_html(md_content):
    """Convert markdown content to HTML"""
    html = md_content
    
    # Extract title and subtitle from first lines
    lines = html.split('\n')
    title = ""
    subtitle = ""
    content_start = 0
    
    for i, line in enumerate(lines):
        if line.startswith('# **') or line.startswith('# '):
            title = re.sub(r'#\s*\*\*(.+?)\*\*', r'\1', line)
            title = re.sub(r'#\s*(.+)', r'\1', title).strip()
            content_start = i + 1
            break
    
    # Check for subtitle
    if content_start < len(lines):
        next_line = lines[content_start].strip()
        if next_line.startswith('###') or next_line.startswith('*'):
            subtitle = re.sub(r'###\s*\*(.+?)\*', r'\1', next_line)
            subtitle = re.sub(r'\*(.+?)\*', r'\1', subtitle).strip()
            content_start += 1
    
    # Join remaining content
    html = '\n'.join(lines[content_start:])
    
    # Convert markdown to HTML
    # Headers
    html = re.sub(r'^# \*\*(.+?)\*\*', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.+?)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^## \*\*(.+?)\*\*', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.+?)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^### \*\*(.+?)\*\*', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.+?)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    html = re.sub(r'^#### (.+?)$', r'<h5>\1</h5>', html, flags=re.MULTILINE)
    
    # Bold and italic
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)
    
    # Horizontal rules
    html = re.sub(r'^---+$', r'<hr>', html, flags=re.MULTILINE)
    
    # Lists - simple approach
    html = re.sub(r'^\* (.+?)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'^\d+\. (.+?)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    
    # Wrap consecutive <li> in <ul>
    html = re.sub(r'(<li>.*?</li>\n)+', lambda m: '<ul>\n' + m.group(0) + '</ul>\n', html, flags=re.DOTALL)
    
    # Paragraphs - wrap non-tag lines
    lines = html.split('\n')
    new_lines = []
    in_paragraph = False
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if in_paragraph:
                new_lines.append('</p>')
                in_paragraph = False
            new_lines.append('')
        elif stripped.startswith('<') or stripped.startswith('---'):
            if in_paragraph:
                new_lines.append('</p>')
                in_paragraph = False
            new_lines.append(line)
        else:
            if not in_paragraph:
                new_lines.append('<p>')
                in_paragraph = True
            new_lines.append(line)
    
    if in_paragraph:
        new_lines.append('</p>')
    
    html = '\n'.join(new_lines)
    
    # Clean up extra paragraph tags
    html = re.sub(r'<p>\s*</p>', '', html)
    html = re.sub(r'<p>\s*(<h[1-6]>)', r'\1', html)
    html = re.sub(r'(</h[1-6]>)\s*</p>', r'\1', html)
    html = re.sub(r'<p>\s*(<ul>)', r'\1', html)
    html = re.sub(r'(</ul>)\s*</p>', r'\1', html)
    html = re.sub(r'<p>\s*(<hr>)', r'\1', html)
    html = re.sub(r'(<hr>)\s*</p>', r'\1', html)
    
    return title, subtitle, html

def main():
    # Paths
    library_source = Path("../library-of-zion")
    library_dest = Path("library")
    
    # Create library directory
    library_dest.mkdir(exist_ok=True)
    
    # Get all markdown files
    md_files = list(library_source.glob("*.md"))
    
    print(f"Found {len(md_files)} markdown files to convert")
    
    for md_file in md_files:
        print(f"Converting {md_file.name}...")
        
        # Read markdown
        with open(md_file, 'r', encoding='utf-8') as f:
            md_content = f.read()
        
        # Convert to HTML
        title, subtitle, content = convert_markdown_to_html(md_content)
        
        # Format subtitle
        subtitle_html = ""
        if subtitle:
            subtitle_html = f'<p class="subtitle">{subtitle}</p>'
        
        # Fill template
        html_output = HTML_TEMPLATE.format(
            title=title or md_file.stem.replace('-', ' ').title(),
            page_title=title or md_file.stem.replace('-', ' ').title(),
            subtitle=subtitle_html,
            content=content
        )
        
        # Write HTML file
        html_file = library_dest / f"{md_file.stem}.html"
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_output)
        
        print(f"  → Created {html_file.name}")
    
    print(f"\nConversion complete! {len(md_files)} files converted.")

if __name__ == "__main__":
    main()

