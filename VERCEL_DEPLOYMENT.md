# Vercel Deployment Guide - New Project

Deploy CAT Mail landing page to a new Vercel project in under 5 minutes.

---

## Step 1: Go to Vercel

Visit: https://vercel.com/new

(Make sure you're logged in. Sign up if needed)

---

## Step 2: Import GitHub Repository

1. Click **Import Git Repository"**
2. Paste your repository URL:
 ```
 https://github.com/fivepanelhat/CAT-mail
 ```
3. Click **Continue"**

---

## Step 3: Configure Project

### Project Settings:
- **Framework Preset**: Other (or Static Site)
- **Root Directory**: ./web
- **Build Command**: (leave empty)
- **Output Directory**: . (current directory)
- **Install Command**: (leave empty)

### Environment Variables:
(None needed for static site)

---

## Step 4: Deploy

Click **Deploy"** and wait for deployment to complete (1-2 minutes).

---

## Step 5: Get Your New URL

Once deployment completes, Vercel will show:
```
[OK] Deployment Complete!
 Your URL: https://your-project-name.vercel.app
```

Copy this URL.

---

## Step 6: Update Links in Repository

Once you have the new URL, update these files:

### 1. README.md
Find and replace:
```
https://cat-mail.vercel.app
```
With your new URL (e.g., `https://cat-mail-fivepanelhat.vercel.app`)

### 2. QUICK_START.md
Find and replace same URL

### 3. RELEASES.md
Find and replace same URL

### 4. PROBLEM_STATEMENT.md
Find and replace same URL

### 5. web/index.html
Find and replace same URL (in links)

Then commit and push:
```bash
git add README.md QUICK_START.md RELEASES.md PROBLEM_STATEMENT.md web/index.html
git commit -m "docs: update Vercel deployment URL to new project"
git push origin master
```

---

## Step 7: Verify Deployment

Visit your new Vercel URL and verify you see:

[OK] Dark blue gradient background 
[OK] Animated blobs flowing 
[OK] "Coastal Alpine Tech Email Agent" title 
[OK] Glass cards with liquid morphism 
[OK] Feature grid 
[OK] Pricing section 
[OK] Installation guide 
[OK] Documentation links 
[OK] Security badge (bottom-right) 

---

## Step 8: Custom Domain (Optional)

If you want a custom domain like `mail.yourdomain.com`:

1. Go to your Vercel project settings
2. Click **Domains**
3. Add your custom domain
4. Follow DNS setup instructions

---

## Troubleshooting

### Site shows blank page
- Wait 2 minutes for Vercel to rebuild
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check Vercel deployment logs for errors

### CSS/Images not loading
- Check browser console for 404 errors
- Verify `web/index.html` path is correct
- Clear browser cache

### Old domain still cached
- The old `cat-mail.vercel.app` domain still exists separately
- Update all references to point to NEW URL
- Old domain won't affect your new deployment

---

## Final Steps

1. [OK] Deploy to new Vercel project
2. [OK] Get new URL
3. [OK] Update all links in repository
4. [OK] Commit and push
5. [OK] Verify deployment works
6. [OK] Share new link with team

---

**Questions?** Check Vercel docs: https://vercel.com/docs

 **Your landing page will be live in minutes!**
