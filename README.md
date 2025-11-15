# Private Chat App (Next.js + Prisma)

A modern private messaging app built with Next.js App Router, Prisma, NextAuth (credentials), and optional Pusher realtime. It includes a users directory, friend requests, conversation list, attachments, presence and typing indicators, and a responsive UI with dark/light theme.

## Features
- Authentication with email/password and verification
- Users directory with search, online presence, friendship status
- Start chat with anyone (friendship not required)
- Chat UI with sender labels, timestamps, edited/deleted markers
- Attachments: image, audio, and files via `/api/uploads`
- Realtime via Pusher with fallback polling when keys are not set
- Conversation list with latest message and unread count
- App shell with theme toggle and toast notifications

## Tech Stack
- Next.js 16 (App Router), React 19, TypeScript
- Prisma ORM (SQLite by default)
- NextAuth (credentials provider)
- Tailwind CSS utility classes
- Pusher server/client (optional)

## Quick Start

### Prerequisites
- Node 18+
- npm, pnpm, or yarn

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` in the project root:
   ```bash
   # Database
   DATABASE_URL="file:./dev.db"

   # Auth
   NEXTAUTH_SECRET="replace-with-32+chars-random"
   NEXTAUTH_URL="http://localhost:3000"
   BCRYPT_SALT_ROUNDS=10

   # Realtime (optional)
   PUSHER_APP_ID="your-app-id"
   PUSHER_KEY="your-server-key"
   PUSHER_SECRET="your-server-secret"
   PUSHER_CLUSTER="mt1"
   NEXT_PUBLIC_PUSHER_KEY="your-public-key"
   NEXT_PUBLIC_PUSHER_CLUSTER="mt1"
   ```
3. Initialize and seed the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

### Production
```bash
npm run build
npm run start
```

## Key Pages
- `/login`, `/register`, `/reset`
- `/chat` and `/chat/[id]`
- `/users`, `/friends`
- `/profile`

## API Highlights
- `POST /api/auth/register` → returns `token`
- `POST /api/auth/verify` → verify email token
- `POST /api/auth/request-reset` and `POST /api/auth/reset-password`
- `GET /api/users/list?q=`
- `POST /api/friends/send`, `POST /api/friends/respond`, `POST /api/friends/remove`, `POST /api/friends/block`, `POST /api/friends/unblock`
- `POST /api/conversations/create-or-get`, `POST /api/conversations/pin`, `POST /api/conversations/archive`
- `GET /api/messages/list`, `POST /api/messages/send`, `POST /api/messages/edit`, `POST /api/messages/delete`, `POST /api/messages/typing`
- `POST /api/uploads` (attachments)

## Notes
- Without Pusher keys, live updates fall back to 3s polling.
- Text messages are sanitized and sending is rate-limited.

## License
MIT (add a LICENSE file before publishing).
