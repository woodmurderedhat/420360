# Jekyll Blog - Quick Reference

## Create a Post (60 seconds)

### 1. Create File
Create in `_posts/` with format: `YYYY-MM-DD-title.md`

Example: `_posts/2024-12-20-my-post.md`

### 2. Add Frontmatter
```markdown
---
title: "Post Title"
date: 2024-12-20
author: Your Name
categories: update
tags: [tag1, tag2]
---
```

### 3. Write Content
```markdown
---
title: "My First Post"
date: 2024-12-20
author: You
---

# Main heading

Your markdown content here...

## Subheading

More content with **bold** and *italic*.
```

### 4. Commit & Push
```bash
git add _posts/2024-12-20-my-post.md
git commit -m "Add post: My First Post"
git push origin main
```

**Wait 30-60 seconds** → Check `/blog/`

---

## File Naming

**Must be exact format:**
```
_posts/YYYY-MM-DD-your-title.md
```

✅ Correct:
- `2024-12-20-first-post.md`
- `2025-01-15-new-update.md`

❌ Wrong:
- `2024-12-20-First-Post.md` (mixed case OK but inconsistent)
- `first-post.md` (missing date)
- `12-20-2024-post.md` (wrong date format)

---

## Frontmatter Fields

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| title | ✅ | Quoted string | `"Post Title"` |
| date | ✅ | YYYY-MM-DD | `2024-12-20` |
| author | ❌ | Text | `Your Name` |
| categories | ❌ | Single word | `update` |
| tags | ❌ | Array | `[tag1, tag2]` |

---

## Markdown Cheatsheet

```markdown
**bold** → bold
*italic* → italic
`code` → code
```code block```
[link](url)
# H1
## H2
### H3
- list item
1. numbered
> blockquote
```

---

## Post URLs

Post at: `_posts/2024-12-20-my-title.md`

Appears at: `/blog/2024/12/20/my-title/`

---

## Workflow

```
1. Create _posts/YYYY-MM-DD-title.md
2. Write markdown with frontmatter
3. git add, commit, push
4. Wait 30-60 seconds
5. Check https://woodmurderedhat.github.io/420360/blog/
```

---

## Template

```markdown
---
title: "Catchy Title"
date: 2024-12-20
author: Your Name
categories: update
tags: [topic1, topic2]
---

# Main Heading

Opening paragraph...

## Section 1

Content here.

## Section 2

More content...

---

Happy blogging! 🚀
```

---

## Troubleshooting

**Post not appearing?**
- Check filename format: `YYYY-MM-DD-title.md` in `_posts/`
- Check frontmatter syntax (colons, quotes)
- Check you pushed: `git push origin main`
- Wait 30-60 seconds for rebuild

**How to check build status:**
GitHub repo → Actions tab → See latest workflow

---

**That's it! Write posts, push, they appear automatically.** 🎉
