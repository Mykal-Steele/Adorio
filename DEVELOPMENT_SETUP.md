# 🚀 Adorio Development & Production Setup Guide

## 📋 Overview

Your application is now configured to work seamlessly in both local development and Render production environments.

## 🔧 Environment Configuration

### Development Environment

- **Command**: `npm run skibidi` or `npm run dev`
- **Frontend**: Runs on `http://localhost:5173` (or 5174 if 5173 is busy)
- **Backend**: Runs on `http://localhost:5000`
- **Environment File**: `.env.development` for both frontend and backend
- **Database**: Uses production MongoDB (same as Render)

### Production Environment (Render)

- **Frontend**: Deployed to `https://mykal-steele.github.io`
- **Backend**: Deployed to `https://feelio-github-io.onrender.com`
- **Environment**: Render injects environment variables directly
- **Database**: Production MongoDB cluster

## 🎮 Available Commands

### Development Commands

```bash
npm run skibidi     # Start both frontend and backend in development
npm run dev         # Same as skibidi
npm run frontend    # Start only frontend (Vite dev server)
npm run backend     # Start only backend (nodemon)
npm run test-env    # Test environment configuration
```

### Production Commands

```bash
npm start           # Start backend in production mode (used by Render)
npm run build       # Build frontend for production
npm run preview     # Preview production build locally
npm run test-prod   # Test production environment configuration
npm run prod        # Run in production mode locally (testing)
```

## 🔒 Protected Routes Setup

### Authentication Requirements

- **All pages require login** except for:
  - `/login` - Login page
  - `/register` - Registration page
  - `/sendenv` - Special utility page (kept unprotected as requested)

### Smart Redirects

- When accessing protected routes without login → redirects to `/login`
- After successful login → redirects to originally requested page
- Login/Register forms remember intended destination
- Cross-navigation between login/register preserves destination

## 🌐 Environment Variables

### Your Render Backend Environment

```
CLIENT_URL=https://mykal-steele.github.io
CLOUDINARY_KEY=434121358531843
CLOUDINARY_NAME=dboeqtx65
CLOUDINARY_SECRET=wF7BHY_N4wA92MWH_62XVY_VQR4
JWT_SECRET="L0okz8zON2kinGi6qnRwZ82W54RszDBZwoF20XmWG1/qy3Ga451o6c19ihZ1EkRfhJAft0MMYAL4DTC6W8pJ1l1RhplKOqvFy1MxzbAuvubXm8+9FfommlYw7QfekLS3ZwR03IuJC1CT7CGTNhsdZgp4GYlLb2oOoJgYk/imHdI="
MONGO_URI="mongodb+srv://mykalstele:mongomykal@cluster0.snup0wa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
NODE_ENV=production
VITE_BACKEND_URL=https://feelio-github-io.onrender.com
VITE_CLOUDINARY_NAME=dboeqtx65
```

### Local Development Files

- **Frontend**: `.env.development` → Points to `http://localhost:5000`
- **Backend**: `backend/.env.development` → Points to `http://localhost:5173`

## 🔍 CORS Configuration

Your backend automatically allows requests from:

- `https://mykal-steele.github.io` (your Render frontend)
- `http://localhost:5173` & `http://localhost:5174` (local development)
- Your domain variants (`adorio.space`, `feelio.space`, etc.)

## 📈 What's Fixed

### ✅ Local Development Issues

- `npm run skibidi` now starts both frontend and backend
- Frontend connects to local backend (`localhost:5000`)
- Backend serves frontend requests with proper CORS
- Environment variables load correctly

### ✅ Production Compatibility

- Render deployment continues to work normally
- Environment detection works for cloud platforms
- No impact on existing production setup
- All your Render environment variables are properly handled

### ✅ Route Protection

- Every page requires authentication except SendEnv
- Smart redirects preserve user's intended destination
- Login/Register flow works seamlessly with protected routes

## 🚨 Important Notes

1. **Render Deployment**: Your production environment uses `npm start` and will continue working exactly as before. The environment loading logic detects when running on Render and uses the injected environment variables.

2. **Local Development**: Use `npm run skibidi` for the full development experience with both frontend and backend running.

3. **Production Testing**: Run `npm run test-prod` to verify your production environment configuration is correct.

4. **Environment Testing**: Run `npm run test-env` to check current environment configuration.

5. **Database**: Both development and production use the same MongoDB cluster. Consider setting up a separate development database if needed.

## 🛠 Troubleshooting

### If Render deployment fails:

1. Check that all environment variables are set in Render dashboard
2. Verify the build command is correct
3. Run `npm run test-env` locally to test configuration

### If local development doesn't work:

1. Ensure ports 5000 and 5173 are available
2. Check that `.env.development` files exist
3. Run `npm run test-env` to verify environment setup

### If CORS errors occur:

1. Check that your frontend URL is in the allowed origins
2. Verify the backend is running on the expected port
3. Make sure environment variables match between frontend and backend

---

🎉 **You're all set!** Your application now works perfectly in both development and production environments with proper authentication protection on all routes except SendEnv.
