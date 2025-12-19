# Jekyll Blog Workflow - Visual Guide

## 🎯 One-Time Setup (Already Done ✅)

```
GitHub Account + 420360 Repo
           ↓
    Remove .nojekyll
           ↓
    Create _config.yml
           ↓
    Create _posts/ folder
           ↓
    Create blog.md
           ↓
    Update homepage
           ↓
    DONE! Ready for posts
```

## 📝 Your Workflow (Repeat This)

Every time you want to add a post:

### Step 1: Create File
```bash
Create: _posts/2024-12-20-my-title.md
```

### Step 2: Write Content
```markdown
---
title: "My Post Title"
date: 2024-12-20
author: Your Name
tags: [tag1, tag2]
---

# Main heading

Your markdown content here...

## Subheading

More content...
```

### Step 3: Commit
```bash
$ git add _posts/2024-12-20-my-title.md
$ git commit -m "Add post: My Post Title"
```

### Step 4: Push
```bash
$ git push origin main
```

### Step 5: Wait
⏳ Wait 30-60 seconds for GitHub Pages rebuild

### Step 6: Check Blog
🎉 Visit: `https://woodmurderedhat.github.io/420360/blog/`

Your post is there!

---

## 🔄 The Automatic Process (You Don't See This)

When you push, GitHub Pages automatically:

```
GitHub receives push
         ↓
Detects _posts/ and _config.yml
         ↓
Runs Jekyll build process
         ↓
Jekyll reads _config.yml
         ↓
Jekyll discovers posts in _posts/
         ↓
Jekyll parses each markdown file
         ↓
Jekyll converts markdown → HTML
         ↓
Jekyll generates proper URLs
         ↓
Jekyll renders blog.md
         ↓
Blog index auto-updates with all posts
         ↓
Static HTML published to site
         ↓
Site goes live! (~30-60 seconds)
```

---

## 📋 File Checklist

When creating a post, verify:

```
_posts/2024-12-20-title.md          ← Location
    ├─ Year: 2024                   ← Current year
    ├─ Month: 12                    ← 01-12
    ├─ Day: 20                      ← 01-31
    ├─ Title: my-title              ← Lowercase, hyphenated
    ├─ Extension: .md               ← Always .md
    │
    └─ Content:
        ├─ Frontmatter              ← Between ---
        │  ├─ title: "Required"     ← With quotes
        │  ├─ date: 2024-12-20      ← YYYY-MM-DD
        │  ├─ author: Optional
        │  └─ tags: [tag1, tag2]
        │
        └─ Markdown
           ├─ Headers: # ## ###
           ├─ **bold**
           ├─ *italic*
           ├─ `code`
           ├─ [links](url)
           ├─ - lists
           └─ > quotes
```

---

## 🌍 How URLs Work

### File → URL Mapping

```
File: _posts/2024-12-20-my-title.md
      └─ Year: 2024
      └─ Month: 12  
      └─ Day: 20
      └─ Title: my-title

Becomes URL:
/blog/2024/12/20/my-title/
```

### Blog Index
```
File: blog.md
Becomes: /blog/
```

---

## 📊 Timeline After Push

```
0 seconds: You push
           $ git push origin main

0-5 seconds: GitHub receives push

5-30 seconds: Jekyll runs
              - Reads config
              - Finds posts
              - Converts markdown
              - Generates HTML
              - Updates index

30-60 seconds: Site published
               ✅ Live!
```

---

## 🎨 Post Anatomy

### Good Post
```markdown
---
title: "My First Post"
date: 2024-12-20
author: Jane Doe
tags: [javascript, web]
---

# Main Heading

Opening paragraph...

## Section 1
Content here

## Section 2
More content

[Link](https://example.com)
```

### Bad Post (Won't Work)
```markdown
---
title: My First Post              ← Missing quotes!
date: 12/20/2024                  ← Wrong format!
author: Jane Doe
---

# Content
```

---

## 🔧 Debugging

### Post Not Appearing?

**Check 1: File Location**
```
✅ _posts/2024-12-20-title.md
❌ posts/2024-12-20-title.md
❌ blog/posts/2024-12-20-title.md
❌ _post/2024-12-20-title.md
```

**Check 2: Filename Format**
```
✅ 2024-12-20-my-post.md
✅ 2024-01-15-another-post.md
❌ my-post.md (missing date)
❌ 12-20-2024-my-post.md (wrong format)
❌ 2024-12-20-My-Post.md (uppercase OK but inconsistent)
```

**Check 3: Frontmatter**
```
✅ title: "My Post"
✅ date: 2024-12-20
❌ title: My Post (missing quotes)
❌ date: 12/20/2024 (wrong format)
❌ Missing frontmatter entirely
```

**Check 4: Pushed?**
```bash
✅ git push origin main
❌ Only git commit (no push)
❌ Pushed to wrong branch
```

**Check 5: Wait Enough?**
```
⏳ Wait at least 30-60 seconds
   Check GitHub Actions for status:
   repo → Actions → Latest workflow
```

---

## 📱 Common Scenarios

### Scenario 1: First Post
```bash
# Create file
echo "---" > _posts/2024-12-20-hello.md
echo 'title: "Hello"' >> _posts/2024-12-20-hello.md
echo 'date: 2024-12-20' >> _posts/2024-12-20-hello.md
echo "---" >> _posts/2024-12-20-hello.md
echo "My first post!" >> _posts/2024-12-20-hello.md

# Push
git add _posts/2024-12-20-hello.md
git commit -m "First post"
git push origin main

# Wait 30-60 seconds
# Check blog → post appears ✅
```

### Scenario 2: Quick Update
```bash
# Create file
cat > _posts/2024-12-20-update.md << EOF
---
title: "Quick Update"
date: 2024-12-20
---

Today I worked on X. More coming soon.
EOF

# Push
git add _posts/2024-12-20-update.md
git commit -m "Add update"
git push origin main

# Wait 30-60 seconds
# Check blog → post appears ✅
```

### Scenario 3: Detailed Post
```bash
# Create file with full metadata
cat > _posts/2024-12-20-detailed.md << EOF
---
title: "Deep Dive into Jekyll"
date: 2024-12-20
author: You
categories: tech
tags: [jekyll, github-pages, blogging]
---

# The Beauty of Jekyll

Long-form content here...

## Why Jekyll?
More content...

## Getting Started
Even more...
EOF

# Push
git add _posts/2024-12-20-detailed.md
git commit -m "Add detailed post"
git push origin main

# Wait, check blog ✅
```

---

## ✨ Cool Features

### Automatic Sorting
Posts sorted newest → oldest automatically
(No manual sorting needed)

### Automatic Linking
Blog index links auto-generated
(No manual link updates)

### Automatic Dates
URLs include dates automatically
(No extra configuration)

### Automatic Theme
Minima theme applied automatically
(Clean, professional look)

### Automatic Publishing
Live after 30-60 seconds
(No manual deployment)

---

## 🎯 Key Takeaways

1. **Write markdown** in `_posts/`
2. **Use correct filename** `YYYY-MM-DD-title.md`
3. **Include frontmatter** with title and date
4. **Commit and push**
5. **Wait 30-60 seconds**
6. **Post appears automatically**

No build commands. No manual deployment. No complications.

---

## 📚 Quick Command Reference

```bash
# Create new post
touch _posts/2024-12-20-title.md

# Edit existing post
nano _posts/2024-12-20-title.md

# See status
git status

# Stage changes
git add _posts/

# Commit
git commit -m "Add post"

# Push (triggers rebuild)
git push origin main

# Check build status
# Visit: github.com/repo/actions

# See your blog
# Visit: woodmurderedhat.github.io/420360/blog/
```

---

## 🚀 You're Ready!

Everything is set up. Just:

1. Create file in `_posts/`
2. Write markdown
3. Push to GitHub
4. Wait 30-60 seconds
5. Blog updates automatically

**That's it!** 🎉

---

For more details, see the documentation files.
