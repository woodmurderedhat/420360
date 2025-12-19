# ✅ Jekyll Integration Complete

Your 420360 site now uses **Jekyll** for automatic blog management on GitHub Pages. Here's everything you need to know.

## What Changed

### Files Added/Modified

**Added (New Jekyll files):**
- `_config.yml` - Jekyll configuration (auto-processes on GitHub Pages)
- `_posts/` - Directory for blog posts (Jekyll standard)
- `_posts/2024-12-19-welcome-to-the-blog.md` - Example post
- `_posts/2024-12-18-getting-started.md` - Example post
- `blog.md` - Blog index page (uses Liquid templates)

**Modified:**
- `index.html` - Updated BLOG button
- `assets/js/homepage.js` - Updated `openBlog()` to navigate to Jekyll blog
- Deleted `.nojekyll` - Enables Jekyll processing

**Previous Custom Blog (kept for reference):**
- `blog/` directory remains for historical reference but is no longer used

## How It Works

### GitHub Pages + Jekyll Workflow

1. **You commit** a markdown file to `_posts/` with format: `YYYY-MM-DD-title.md`
2. **You push** to GitHub
3. **GitHub Pages automatically:**
   - Detects the new post
   - Runs Jekyll to convert markdown → HTML
   - Publishes to your site
4. **Post appears** at `https://woodmurderedhat.github.io/420360/blog/`

**No build steps. No manual deployment. Just write and push.**

## Adding Your First Post

### Step 1: Create a Markdown File

Create a file in the `_posts/` directory with this exact naming format:

```
YYYY-MM-DD-your-title.md
```

Examples:
- `2024-12-20-my-first-post.md`
- `2024-12-20-thoughts-on-retro-web.md`
- `2025-01-01-new-year-update.md`

### Step 2: Add Frontmatter and Content

```markdown
---
title: "Your Post Title"
date: 2024-12-20
author: Your Name
categories: update
tags: [tag1, tag2, tag3]
---

# Your Content

Your post content goes here in markdown...

## Subheading

More content with **bold** and *italic* text.
```

### Step 3: Commit and Push

```bash
git add _posts/2024-12-20-my-first-post.md
git commit -m "Add blog post: My First Post"
git push origin main
```

Wait 30-60 seconds for GitHub Pages to rebuild, then check:
```
https://woodmurderedhat.github.io/420360/blog/
```

Your post appears automatically! 🎉

## File Structure

```
420360/
├── _config.yml              ← Jekyll configuration
├── _posts/                  ← Blog posts (Jekyll standard)
│   ├── 2024-12-19-welcome-to-the-blog.md
│   └── 2024-12-18-getting-started.md
├── blog.md                  ← Blog index page (Jekyll processes this)
├── blog/                    ← Old custom blog (kept for reference)
│   ├── posts/
│   ├── index.html
│   └── ... (no longer used)
├── index.html               ← Homepage (BLOG button now navigates to Jekyll blog)
└── ... (rest of site)
```

## Frontmatter Reference

Every post must start with frontmatter between `---` lines:

```yaml
---
title: "Required: Your Post Title"
date: 2024-12-20
author: Optional: Your Name
categories: Optional: category-name
tags: [optional, tag, list]
---
```

### Fields Explained

- **title** (required) - The post title. Use quotes: `"Title"`
- **date** (required) - Publication date: `YYYY-MM-DD` format
- **author** (optional) - Your name. Jekyll displays this on the post
- **categories** (optional) - Single category like "updates", "dev-notes", "thoughts"
- **tags** (optional) - Array of tags: `[tag1, tag2, tag3]` (lowercase recommended)

## Markdown Support

Your posts support full markdown:

| Format | Syntax | Result |
|--------|--------|--------|
| **Bold** | `**text**` | **text** |
| *Italic* | `*text*` | *text* |
| `Code` | `` `code` `` | `code` |
| [Links](https://example.com) | `[text](url)` | Clickable links |
| Headers | `## Heading` | Styled headers |
| Lists | `- item` | Bulleted lists |
| Code blocks | ` ```code``` ` | Formatted code |
| Blockquotes | `> quote` | Styled quotes |

## Common Workflows

### Create a Quick Update

```bash
# 1. Create the file
# _posts/2024-12-20-quick-update.md

---
title: "Quick Update"
date: 2024-12-20
---

Today I worked on X. More coming soon.

# 2. Commit and push
git add _posts/2024-12-20-quick-update.md
git commit -m "Add quick update"
git push origin main

# 3. Wait 30-60 seconds
# 4. Check: https://woodmurderedhat.github.io/420360/blog/
```

### Write a Detailed Post

```bash
# Create with full metadata
# _posts/2024-12-20-detailed-post.md

---
title: "Detailed Post Title"
date: 2024-12-20
author: Your Name
categories: dev-updates
tags: [javascript, markdown, jekyll]
---

# Main heading

Full content with multiple paragraphs, code examples, etc.

## Subheading

More detailed information.
```

## Understanding Jekyll URLs

Posts are published at this path:

```
/blog/YYYY/MM/DD/post-title/
```

Examples:

- File: `2024-12-20-my-post.md` → URL: `/blog/2024/12/20/my-post/`
- File: `2025-01-15-new-update.md` → URL: `/blog/2025/01/15/new-update/`

The date is automatically extracted from the filename.

## Blog Index Page

The blog index is at `/blog/` (which is `blog.md` processed by Jekyll).

It automatically:
- Lists all posts (newest first)
- Shows date, author, tags
- Links to each post
- Updates whenever you add a post

**No manual updating needed.**

## Why This Is Better

### vs. Custom Blog System

✅ **No JavaScript parsing needed** - Jekyll does it server-side
✅ **Automatic updates** - Just commit and push
✅ **Better SEO** - Jekyll generates proper HTML structure
✅ **No posts.json to maintain** - Jekyll auto-discovers files
✅ **Standard Jekyll format** - Works with Jekyll everywhere
✅ **GitHub Pages native** - Built-in support, no extra config

## Important Notes

1. **File naming matters** - `YYYY-MM-DD-title.md` format is strict
2. **Frontmatter is required** - The `---` section at the top
3. **No date in filename = ignored** - Jekyll only processes posts with dates
4. **Newest first** - Posts sorted by date descending
5. **Wait for rebuild** - GitHub takes 30-60 seconds to publish

## Troubleshooting

### Post Not Appearing?

**Check:**
1. File in `_posts/` directory? (not `blog/posts/`)
2. Correct filename format? (`YYYY-MM-DD-title.md`)
3. Frontmatter included? (between `---` lines)
4. Committed and pushed? 
5. Waited 30-60 seconds?

If still not working:
1. Check GitHub Actions (repo → Actions tab)
2. Look for build errors in the logs

### Frontmatter Error?

Ensure:
- Title has quotes: `title: "Your Title"` 
- Date format: `YYYY-MM-DD`
- No special characters unless escaped
- Valid YAML syntax (colons, indentation matter)

### Old Custom Blog?

The `blog/` directory is kept for reference but no longer used.
You can delete it when ready, but it's safe to keep.

## Next Steps

1. ✅ Jekyll is configured and working
2. 📝 Create your first post in `_posts/`
3. 🚀 Commit and push
4. ⏳ Wait 30-60 seconds
5. 🎉 See your post at `/420360/blog/`

## Advanced Features (Optional)

Once basic blogging works, Jekyll supports:

- **Categories and Tags** - Already included in frontmatter
- **RSS Feed** - Jekyll generates automatically
- **Custom Layouts** - Style posts differently
- **Pagination** - Already configured in `_config.yml`
- **Collections** - Organize posts by type
- **Plugins** - GitHub Pages supports many Jekyll plugins

## Reference Links

- [Jekyll Documentation](https://jekyllrb.com/)
- [GitHub Pages + Jekyll Docs](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll)
- [Jekyll Posts Format](https://jekyllrb.com/docs/posts/)

---

**Your blog is now powered by Jekyll and GitHub Pages. Just write markdown and push!** 🚀
