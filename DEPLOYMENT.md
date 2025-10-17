# 🚀 Deployment Guide - SignaturePro

This guide will help you deploy the full-stack SignaturePro application to **Render** (recommended) or other platforms.

## 📋 Prerequisites

- GitHub account (you already have this!)
- Render account (free) - Sign up at https://render.com

---

## 🎯 Option 1: Deploy to Render (Recommended - FREE)

Render is perfect for full-stack Flask + React apps and has a generous free tier.

### Step 1: Push Your Code to GitHub

```bash
./git-push.sh
```

Make sure all your code is pushed to: https://github.com/Juan-Cwq/e-sign-watermark-app

### Step 2: Create a Render Account

1. Go to https://render.com
2. Sign up with GitHub (easiest option)
3. Authorize Render to access your repositories

### Step 3: Create a New Web Service

1. Click **"New +"** button → **"Web Service"**
2. Connect your GitHub repository: `Juan-Cwq/e-sign-watermark-app`
3. Configure the service:

   **Basic Settings:**
   - **Name**: `signaturepro` (or any name you like)
   - **Region**: Choose closest to you (e.g., Oregon)
   - **Branch**: `main`
   - **Runtime**: `Python 3`

   **Build & Deploy Settings:**
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn app:app`

   **Instance Type:**
   - Select **"Free"** (0$/month)

### Step 4: Add Environment Variables

Click **"Advanced"** and add these environment variables:

| Key | Value |
|-----|-------|
| `FLASK_ENV` | `production` |
| `FLASK_DEBUG` | `0` |
| `FLASK_SECRET_KEY` | Click "Generate" |
| `ENCRYPTION_KEY` | Click "Generate" |
| `PYTHON_VERSION` | `3.11.0` |

### Step 5: Deploy!

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for the build to complete
3. Your app will be live at: `https://signaturepro.onrender.com` (or your chosen name)

### Step 6: Test Your App

Visit your Render URL and test:
- ✅ Upload a signature
- ✅ Create a watermark
- ✅ Apply to a document

---

## 🎯 Option 2: Deploy to Railway

Railway is another excellent option with a simple deployment process.

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Deploy from GitHub

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose `Juan-Cwq/e-sign-watermark-app`
4. Railway will auto-detect it's a Python app

### Step 3: Configure

1. Add environment variables (same as Render above)
2. Set build command: `./build.sh`
3. Set start command: `gunicorn app:app`

### Step 4: Deploy

Railway will automatically deploy and give you a URL!

---

## 🎯 Option 3: Deploy to Heroku

Heroku is a classic choice (requires credit card for free tier).

### Step 1: Install Heroku CLI

```bash
brew install heroku/brew/heroku
```

### Step 2: Login and Create App

```bash
heroku login
heroku create signaturepro
```

### Step 3: Add Buildpacks

```bash
heroku buildpacks:add --index 1 heroku/python
heroku buildpacks:add --index 2 heroku/nodejs
```

### Step 4: Set Environment Variables

```bash
heroku config:set FLASK_ENV=production
heroku config:set FLASK_DEBUG=0
heroku config:set FLASK_SECRET_KEY=$(openssl rand -hex 32)
heroku config:set ENCRYPTION_KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
```

### Step 5: Create Procfile

Already created! The `Procfile` tells Heroku how to run your app.

### Step 6: Deploy

```bash
git push heroku main
```

---

## 📝 Important Notes

### File Storage

⚠️ **Important**: Free tier platforms use **ephemeral storage**, meaning uploaded files will be deleted when the server restarts.

**Solutions:**
1. **For Production**: Integrate cloud storage (AWS S3, Google Cloud Storage, Cloudinary)
2. **For Testing**: Files will persist during your session but may be lost on restart

### Database (Optional)

If you want to add user accounts or persistent data:
- Render: Add a PostgreSQL database (free tier available)
- Railway: Add PostgreSQL from the dashboard
- Heroku: `heroku addons:create heroku-postgresql:mini`

### Custom Domain (Optional)

All platforms support custom domains:
- **Render**: Settings → Custom Domain
- **Railway**: Settings → Domains
- **Heroku**: Settings → Domains

---

## 🔧 Troubleshooting

### Build Fails

**Issue**: Python package installation fails

**Solution**: 
- Check `runtime.txt` specifies Python 3.11.0
- Verify `requirements.txt` has `opencv-python-headless` (not `opencv-python`)

### App Crashes on Start

**Issue**: Gunicorn can't find the app

**Solution**: 
- Verify start command is exactly: `gunicorn app:app`
- Check that `app.py` is in the root directory

### Frontend Not Loading

**Issue**: React app shows 404

**Solution**:
- Ensure `npm run build` completed successfully
- Check that `dist` folder exists after build
- Verify Flask is serving from `static_folder='dist'`

### API Calls Failing

**Issue**: CORS errors or API not responding

**Solution**:
- Check environment variables are set
- Verify API routes start with `/api/`
- Check Flask-CORS is installed

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] App loads at your deployment URL
- [ ] Can upload and process a signature
- [ ] Can create a text watermark
- [ ] Can create an image watermark
- [ ] Can upload a document
- [ ] Can apply signature/watermark to document
- [ ] Can download processed document
- [ ] Library shows saved items

---

## 💡 Next Steps After Deployment

1. **Add Cloud Storage**: Integrate AWS S3 or Cloudinary for persistent file storage
2. **Add Authentication**: Implement user accounts with Flask-Login
3. **Add Database**: Store user data and metadata in PostgreSQL
4. **Monitor Performance**: Use Render's built-in monitoring
5. **Set Up CI/CD**: Auto-deploy on git push
6. **Add Analytics**: Track usage with Google Analytics
7. **Custom Domain**: Point your own domain to the app

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Heroku Docs**: https://devcenter.heroku.com

---

**🎊 Congratulations on deploying SignaturePro!**

Your app is now live and accessible to anyone with the URL!
