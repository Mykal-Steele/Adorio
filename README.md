<!-- cspell:ignore Adorio adorio -->

# Adorio

A portfolio site and showcase of different project collections and a place to host my works and make tools I need for myself and my friends

## Check out the live site

Live demo: [adorio.space](https://www.adorio.space)

## Features

- **User Accounts** - Signup, login, authentication with JWT
- **Posts** - Create posts with text and optional images
- **Likes** - Like/unlike posts with optimistic updates
- **Comments** - Comment on posts
- **Infinite Scroll** - Posts load as you scroll down
- **Responsive Design** - Works on mobile, tablet, desktop
- **Image Uploads** - Cloudinary integration for storage
- **Animations** - Smooth transitions using Framer Motion
- **Emoji Picker** - Add emojis to comments
- **Security** - CSP implementation to prevent XSS attacks

## Tech Stack

### Frontend:

- React
- Redux for state management
- Vite
- Tailwind
- Framer-Motion
- Axios
- Moment.js
- DOMPurify

### Backend:

- Node.js + Express
- MongoDB
- JWT
- Cloudinary for image storage + compression

## How to Run

### Frontend:

```bash
pnpm install
pnpm run dev
# Build for production
pnpm run build
# Build + deploy
pnpm run smt
```

### Backend:

```bash
cd backend
pnpm install
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

- Frontend and backend containerized and deployed on NorthFlank

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
└── public/               # Static assets + random files i want to share
```

## Todo

- [ ] Add profile pics
- [ ] Notifications
- [ ] Direct messages
- [ ] Follow/unfollow users
- [ ] Hashtags (Categories)

## Contributing

This is primarily a personal project, but contributions are welcome:

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/my-change`)
3. Commit your changes (`git commit -m 'Describe your change'`)
4. Push to the branch (`git push origin feature/my-change`)
5. Open a Pull Request

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

You can use, modify, and share this project. If you modify it and run it as a network service, you must share those changes under AGPL-3.0 terms.

[Full license details](https://www.gnu.org/licenses/agpl-3.0.en.html)
