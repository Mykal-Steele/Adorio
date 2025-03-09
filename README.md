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

```
# Frontend .env
VITE_BACKEND_URL=http://localhost:5000

# Backend .env
PORT=5000
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
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routes
│   ├── middleware/       # Custom middleware
│   └── index.js          # Server entry point
└── public/               # Static assets
```

## Todo

- [ ] Add profile pics
- [ ] Notifications
- [ ] Direct messages
- [ ] Follow/unfollow users
- [ ] Search functionality
- [ ] Hashtags

## Contributing

This is mostly my personal project but if you wanna contribute for some reason:

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Just don't steal it and say you made it lol
