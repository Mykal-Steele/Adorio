# Adorio - Social Media Project

A social platform I built with React, Node, and MongoDB. Basically trying to make something that doesn't suck for my portfolio lol

## Check It Out

Live demo: [adorio.space](https://www.adorio.space)

## Features

- **User Accounts** - Signup, login, authentication with JWT
- **Posts** - Create posts with text and optional images
- **Likes** - Like/unlike posts with optimistic updates
- **Comments** - Comment on posts with real-time updates
- **Infinite Scroll** - Posts load as you scroll down
- **Responsive Design** - Works on mobile, tablet, desktop
- **Image Uploads** - Cloudinary integration for storage
- **Animations** - Smooth transitions using Framer Motion
- **Emoji Picker** - Add emojis to comments
- **404 Page** - That sick cyberpunk page with the spotlight effect
- **Security** - CSP implementation to prevent XSS attacks

## Tech Stack

### Frontend:

- React (with Hooks, Context)
- Redux Toolkit for state management
- Vite for blazing fast builds
- Tailwind CSS for styling (no more CSS files everywhere)
- Framer-Motion for animations
- Axios for API calls
- Moment.js for time formatting
- DOMPurify for security

### Backend:

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Cloudinary for image storage
- Compression for better performance
- Rate limiting to prevent spam

## How to Run This Thing

### Frontend:

```bash
# Install deps
npm install
# Dev server with hot reload
npm run skibidi
# Build for production
npm run build
# Build + deploy
npm run smt
```

### Backend:

```bash
# Go to backend folder
cd backend
# Install deps
npm install
# Run server
node index.js
# Or with nodemon for development
npm run dev
```

## Environment Variables

Create a `.env` file in the root and backend folder:

```env
# Frontend .env
VITE_BACKEND_URL=http://localhost:3000
# Backend .env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
```

## Deployment

- Frontend deployed on Vercel
- Backend deployed on Render.com
- MongoDB Atlas for database

## Project Structure

```
├── src/                  # Frontend code
│   ├── api/              # API calls to backend
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── redux/            # Redux store and slices
│   └── utils/            # Utility functions
├── backend/              # Backend code
│   ├── config/           # Environment, CORS, rate limit, DB helpers
│   ├── controllers/      # Express handlers coordinating services
│   ├── services/         # Business logic and data access helpers
│   ├── utils/            # Shared utilities (errors, async helpers)
│   ├── middleware/       # Cross-cutting Express middleware
│   └── index.js          # Server entry point
└── public/               # Static assets

## Architecture Notes

- **Backend** now follows a controller/service split so routes stay tiny and easier to test. Shared configuration (database, CORS, rate limiting, Cloudinary) lives in `backend/config` for single-source-of-truth settings. Custom `ApiError` and `asyncHandler` utilities keep error handling consistent across the stack.
- **Frontend** bootstraps authentication via `useAuthBootstrap`, bringing Redux hydration, local storage management, and helper side effects into one place. API calls resolve their base URL from `src/config/apiConfig.js`, which keeps browser and SSR environments in sync without scattered `process.env` checks.
- **Comments & PropTypes** were added in critical components to make intent obvious for new contributors. If you're unsure where to add a feature, look for existing services/controllers on the backend or the hooks/components pattern on the frontend to stay aligned.
```

## Todo

- [ ] Add profile pics
- [ ] Notifications
- [ ] Direct messages
- [ ] Follow/unfollow users
- [ ] Search functionality
- [ ] Hashtags

## Deployment

### Proxy Configuration

When deploying behind a reverse proxy (Render, Heroku, Cloudflare, etc.), the app automatically configures Express's `trust proxy` setting to handle forwarded headers properly.

**Environment Variables:**

- `TRUST_PROXY` - Override proxy trust setting (true/false/number/IP)
- Default behavior:
  - Production: Trust 1 proxy (Render/Heroku) or 2 proxies (Cloudflare)
  - Development: Trust all proxies

**Common Platforms:**

- **Render/Heroku**: Automatically detected, trusts 1 proxy
- **Cloudflare**: Set `CLOUDFLARE=true` or detected via `CF_RAY` header
- **Custom**: Set `TRUST_PROXY=2` for multiple proxies

This fixes the `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` error from express-rate-limit.

### Analytics & Monitoring

The app includes built-in analytics with:

- Real-time visitor tracking
- Page view statistics
- User behavior analysis
- Health monitoring at `/api/health`

## Contributing

This is mostly my personal project but if you wanna contribute for some reason:

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

Basically, you can use this, change it, or share it - but if you modify it and run it as a service, you gotta share those changes. Just don't steal it and say you made it lol.

[Full license details](https://www.gnu.org/licenses/agpl-3.0.en.html)
