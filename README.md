# Cloaka Frontend

Production-ready frontend for the Cloaka traffic filtering platform.

## Tech Stack

- **React 18** with TypeScript
- **React Router** for routing and navigation
- **TanStack Query** for server state management
- **Zustand** for client state management
- **Zod** for schema validation
- **React Hook Form** for form handling
- **Tailwind CSS** for styling
- **Vite** for build tooling

## Project Structure

```
src/
├── app/                    # Application setup
│   ├── Providers.tsx       # Query client, auth initialization
│   └── Router.tsx          # Route configuration
├── features/               # Feature modules
│   ├── auth/              # Authentication
│   │   ├── api.ts         # Auth API methods
│   │   ├── store.ts       # Auth state (Zustand)
│   │   └── pages/         # Login, Register, Profile
│   └── streams/           # Stream management
│       ├── api.ts         # Streams API methods
│       ├── components/    # StreamForm, etc.
│       └── pages/         # List, Create, Detail, Trash
├── shared/                # Shared utilities
│   ├── api/              # API client with error handling
│   ├── guards/           # AuthGuard, RoleGuard
│   ├── lib/              # Zod schemas and types
│   ├── pages/            # 403, 404 pages
│   ├── types/            # TypeScript types
│   └── ui/               # Reusable UI components
└── App.tsx               # Root component
```

## Features

### Authentication
- Email/password authentication with session cookies
- Auto-redirect on 401/403 responses
- Form validation with Zod
- Protected routes with guards

### Stream Management
- CRUD operations for streams
- Soft delete (trash/restore)
- Permanent deletion with confirmation
- Search and filtering
- Detector options configuration
- Geo-targeting support

### UI/UX
- Dark-first minimal design inspired by Linear/Vercel
- Responsive layout with collapsible sidebar
- Toast notifications
- Confirmation dialogs
- Loading and empty states
- Error pages (403, 404)

## API Integration

All API calls use `credentials: "include"` for cookie-based authentication.

Base URL: `/api`

### Auth Endpoints
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Streams Endpoints
- `GET /api/streams` - List streams (with filters)
- `POST /api/streams` - Create stream
- `GET /api/streams/:id` - Get stream details
- `PUT /api/streams/:id` - Update stream
- `PATCH /api/streams/:id/trash` - Soft delete
- `PATCH /api/streams/:id/restore` - Restore from trash
- `DELETE /api/streams/:id` - Permanent delete

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Type Checking

```bash
npm run typecheck
```

## Extending Detector Options

See `EXTENSION_EXAMPLE.md` for details on adding new detector options without refactoring.

## Design System

### Colors
- Primary: Violet (`#8b5cf6`)
- Background: Dark zinc (`#09090b`, `#18181b`)
- Text: Light zinc (`#fafafa`, `#a1a1aa`)

### Typography
- Font: Inter
- Headings: 500-600 weight
- Body: 400 weight
- Line height: 150% for body, 120% for headings

### Spacing
- Base unit: 8px
- Consistent padding/margins following 8px grid

### Components
- Border radius: 8px (rounded-lg)
- Borders: Subtle zinc-800
- Hover states: Soft transitions (150-200ms)
- Focus: Violet ring
