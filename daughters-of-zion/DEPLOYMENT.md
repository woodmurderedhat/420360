# Deployment Guide for GitHub Pages

This guide will help you deploy the Daughters of Zion website to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your computer (optional, can use GitHub web interface)
- This `book_2` folder with all its contents
- All markdown files from `library-of-zion` have been converted to styled HTML in the `library/` folder

## Before Deployment

1. **Update sitemap.xml**: Replace `yourusername` with your actual GitHub username
2. **Test locally**: Open `index.html` in your browser to verify everything works
3. **Check all links**: Make sure all internal links work correctly

## Method 1: Deploy from This Repository (Recommended)

### Step 1: Push to GitHub

If you haven't already, push this repository to GitHub:

```bash
cd "c:\Users\Stephanus\Documents\daughters of zion"
git add .
git commit -m "Add Book 2 website"
git push origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select your branch (usually `main` or `master`)
5. Under **Folder**, select `/book_2`
6. Click **Save**

### Step 3: Wait for Deployment

- GitHub will build and deploy your site (usually takes 1-2 minutes)
- You'll see a green checkmark when it's ready
- Your site will be available at: `https://[your-username].github.io/daughters-of-zion/`

## Method 2: Dedicated Repository

If you want the website at the root level (cleaner URLs):

### Step 1: Create New Repository

1. Go to GitHub and create a new repository
2. Name it `daughters-of-zion-website` (or any name you prefer)
3. Make it public
4. Don't initialize with README (we already have files)

### Step 2: Copy Files to New Repository

```bash
# Create a new directory
mkdir daughters-of-zion-website
cd daughters-of-zion-website

# Copy all files from book_2 (not the book_2 folder itself)
# On Windows PowerShell:
Copy-Item "c:\Users\Stephanus\Documents\daughters of zion\book_2\*" -Destination . -Recurse

# Initialize git
git init
git add .
git commit -m "Initial commit: Daughters of Zion website"

# Add remote and push
git remote add origin https://github.com/[your-username]/daughters-of-zion-website.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to repository Settings → Pages
2. Select branch `main`
3. Select folder `/ (root)`
4. Click Save

Your site will be at: `https://[your-username].github.io/daughters-of-zion-website/`

## Method 3: Using GitHub Web Interface (No Git Required)

### Step 1: Create Repository

1. Go to GitHub and click **New Repository**
2. Name it `daughters-of-zion-website`
3. Make it public
4. Click **Create repository**

### Step 2: Upload Files

1. Click **uploading an existing file**
2. Drag and drop ALL files and folders from `book_2`
3. Make sure to maintain the folder structure:
   - `pages/` folder with all HTML files
   - `styles/` folder with all CSS files
   - `scripts/` folder with all JS files
   - `index.html` at root
   - `404.html` at root
   - `.nojekyll` file
4. Commit the files

### Step 3: Enable GitHub Pages

1. Go to Settings → Pages
2. Select branch `main`
3. Select folder `/ (root)`
4. Click Save

## Verification

After deployment, verify your site:

1. Visit the URL provided by GitHub Pages
2. Check that all pages load correctly
3. Test navigation between pages
4. Verify that links to library documents work
5. Test on mobile device

## Troubleshooting

### Pages Not Loading

- Make sure `.nojekyll` file is present
- Check that all file paths are relative (no absolute paths)
- Verify folder structure is intact

### 404 Errors

- Check that file names match exactly (case-sensitive)
- Ensure all links use correct relative paths
- Verify `404.html` is in the root directory

### Styles Not Loading

- Check that CSS files are in `styles/` folder
- Verify `<link>` tags in HTML have correct paths
- Clear browser cache and reload

### Library Links Not Working

The library links point to `../../library-of-zion/` which assumes the library folder is at the repository root. If you're using Method 2 (dedicated repository), you have two options:

**Option A**: Copy the library folder into the website
```bash
cp -r "../library-of-zion" "./library-of-zion"
```

**Option B**: Update the links in `pages/library.html` to point to the original repository:
```html
<a href="https://github.com/[username]/daughters-of-zion/tree/main/library-of-zion/veiled-daughters-of-zion.md">
```

## Custom Domain (Optional)

To use a custom domain:

1. Purchase a domain from a registrar
2. In GitHub Pages settings, add your custom domain
3. Configure DNS with your registrar:
   - Add a CNAME record pointing to `[username].github.io`
   - Or add A records pointing to GitHub's IPs
4. Enable HTTPS in GitHub Pages settings

## Updates

To update the website:

1. Make changes to your local files
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update content"
   git push
   ```
3. GitHub Pages will automatically rebuild (1-2 minutes)

## Performance Tips

- The site is already optimized for GitHub Pages
- No build process needed
- All resources are self-contained
- No external dependencies to slow loading

## Support

If you encounter issues:

1. Check GitHub Pages status: https://www.githubstatus.com/
2. Review GitHub Pages documentation: https://docs.github.com/en/pages
3. Verify all files are committed and pushed
4. Check browser console for errors

---

**Your website is now live and accessible to the world!**

The Daughters of Zion archive is preserved and available for all who seek it.

