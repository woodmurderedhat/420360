# GitHub Pages Deployment Guide

This guide explains how to deploy the Generative Art application to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your local machine
- The Generative Art application code

## Deployment Steps

### 1. Create a GitHub Repository

1. Log in to your GitHub account
2. Click the "+" icon in the top-right corner and select "New repository"
3. Name your repository (e.g., "generative-art")
4. Choose whether to make it public or private
5. Click "Create repository"

### 2. Push Your Code to GitHub

1. Initialize a Git repository in your local project folder (if not already done):
   ```bash
   git init
   ```

2. Add all files to the repository:
   ```bash
   git add .
   ```

3. Commit the changes:
   ```bash
   git commit -m "Initial commit"
   ```

4. Add the GitHub repository as a remote:
   ```bash
   git remote add origin https://github.com/yourusername/generative-art.git
   ```

5. Push the code to GitHub:
   ```bash
   git push -u origin main
   ```

### 3. Configure GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select the branch you want to deploy (usually "main")
5. Select the folder (usually "/ (root)") and click "Save"
6. GitHub will provide you with a URL where your site is published (e.g., https://yourusername.github.io/generative-art/)

### 4. Verify Deployment

1. Wait a few minutes for GitHub Pages to build and deploy your site
2. Visit the provided URL to ensure your application is working correctly
3. Test all functionality to make sure everything works in the GitHub Pages environment

## Troubleshooting

### Issue: Resources Not Loading

If images, scripts, or stylesheets aren't loading, check that:

1. All file paths use relative URLs (e.g., `./js/main.js` instead of `/js/main.js`)
2. Case sensitivity is correct (GitHub Pages is case-sensitive)
3. No absolute URLs are used that point to localhost or other environments

### Issue: 404 Errors

If you're getting 404 errors:

1. Make sure the repository name in the GitHub Pages URL matches your actual repository name
2. Check that the branch you're deploying from contains all necessary files
3. Verify that the index.html file is in the root of the deployed branch

### Issue: JavaScript Not Working

If JavaScript functionality isn't working:

1. Check the browser console for errors
2. Ensure all JavaScript modules are properly imported with relative paths
3. Verify that all JavaScript files are included in the repository

## Updating Your Deployment

To update your GitHub Pages deployment:

1. Make changes to your local code
2. Commit the changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```
3. Push to GitHub:
   ```bash
   git push origin main
   ```
4. GitHub Pages will automatically rebuild and deploy your site

## Custom Domain (Optional)

To use a custom domain with your GitHub Pages site:

1. Go to your repository's "Settings"
2. Scroll down to the "GitHub Pages" section
3. Under "Custom domain", enter your domain name and click "Save"
4. Configure your domain's DNS settings as instructed by GitHub
5. Wait for DNS propagation (can take up to 24 hours)

## Best Practices for GitHub Pages

1. Keep your repository organized and clean
2. Use relative paths for all resources
3. Minimize repository size by excluding unnecessary files
4. Use a .gitignore file to exclude development files
5. Test your application locally before pushing changes
6. Consider using GitHub Actions for automated testing and deployment

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Pages Basics](https://pages.github.com/)
- [Troubleshooting GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites)
