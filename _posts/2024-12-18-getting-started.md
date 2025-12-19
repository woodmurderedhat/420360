---
title: "Getting Started with Your Blog"
date: 2024-12-18
author: Stephanus
categories: guide
tags: [guide, markdown, getting-started]
---

Now that your blog is set up, here's everything you need to know to get started writing posts.

## Adding New Posts

Adding a post is a simple 2-step process:

1. **Create a markdown file** in the `_posts/` directory with the format: `YYYY-MM-DD-title.md`
2. **Commit and push** to GitHub

### File Naming Convention

Files must follow this exact format:

```
YYYY-MM-DD-post-title.md
```

Examples:
- `2024-12-19-my-first-post.md`
- `2024-12-18-getting-started.md`
- `2025-01-01-new-year-thoughts.md`

### Post Template

Start with this template:

```markdown
---
title: "Your Post Title"
date: 2024-12-18
author: Your Name
categories: category
tags: [tag1, tag2, tag3]
---

# Your Content Starts Here

Write your post in markdown format...
```

Then add your content below the frontmatter.

## Markdown Formatting

Here are some examples:

**Bold text:** `**bold**` → **bold**

*Italic text:* `*italic*` → *italic*

`Inline code:` ``` `code` ``` → `code`

Links: `[Click here](https://example.com)` → [Click here](https://example.com)

### Lists

```markdown
- Item 1
- Item 2
- Item 3

1. Numbered 1
2. Numbered 2
```

### Code Blocks

````markdown
```
code goes here
more code
```

```python
# With syntax highlighting
def hello():
    print("world")
```
````

### Blockquotes

```markdown
> This is a blockquote
> 
> It can span multiple lines
```

## Best Practices

- **Keep titles clear** and descriptive
- **Use consistent date format**: `YYYY-MM-DD`
- **Add relevant tags** to help organize posts
- **Use headers** to structure content (`##` and `###`)
- **Keep paragraphs readable** (not too long)
- **Use categories** for broad grouping (like "updates", "dev-notes", "thoughts")
- **Use tags** for specific topics

## The Workflow

1. Create `_posts/2024-12-19-my-post.md`
2. Write your markdown content
3. Commit: `git add _posts/2024-12-19-my-post.md`
4. Push: `git push origin main`
5. Wait ~30 seconds for GitHub Pages to rebuild
6. Your post appears at `https://woodmurderedhat.github.io/420360/blog/`

That's it! No database, no CMS, no complications.

## What Happens Next?

Once you commit and push, GitHub Pages automatically:

1. Detects your new markdown file
2. Runs Jekyll to convert it to HTML
3. Publishes it to your blog
4. Updates the blog index page

Posts are displayed newest first by default.

---

Happy blogging! 🚀
