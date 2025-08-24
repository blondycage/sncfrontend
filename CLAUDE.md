# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Next.js)
- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting

### Backend (Express.js)
- `cd backend && npm run dev` - Start backend development server with nodemon (port 5000)
- `cd backend && npm start` - Start production backend server
- `cd backend && npm test` - Run API tests
- `cd backend && npm run db:seed` - Seed database with sample data
- `cd backend && npm run jobs:seed` - Seed job listings
- `cd backend && npm run promotions:seed` - Seed promotion data

## Architecture Overview

This is a full-stack ad listing platform for North Cyprus built with:

### Frontend Stack
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** + **shadcn/ui** components
- **Radix UI** primitives for accessible components
- **React Hook Form** + **Zod** for form validation
- **next-themes** for theme support
- **Sonner** for toast notifications

### Backend Stack
- **Express.js** API server
- **MongoDB** with Mongoose ODM
- **JWT** authentication with bcrypt
- **Cloudinary** for image storage
- **Nodemailer** for email services
- **Express Rate Limit** for API protection

### Key Architectural Patterns

#### Authentication System
- JWT tokens stored in localStorage with cookie backup for middleware
- Cookie-based middleware protection for protected routes
- Dual authentication: email/password + Telegram integration
- Role-based access control (user/admin)
- Auth context provider at `app/contexts/AuthContext.tsx`

#### API Layer
- Centralized API client at `lib/api.ts` with automatic token attachment
- Custom ApiError class for consistent error handling
- Built-in toast notifications for API responses
- Environment-based API URL configuration

#### Route Protection
- Middleware at `middleware.ts` protects routes using cookies
- Protected routes: `/dashboard`, `/profile`, `/create-listing`
- Admin routes: `/admin/*` (role-based protection)

#### Component Architecture
- UI components in `components/ui/` using shadcn/ui patterns
- Business components organized by feature
- Shared layouts in `admin/` folder for admin interface
- Context providers in `app/providers.tsx`

#### Database Models (Backend)
- User: authentication, profile, role management
- Listing: property/job/service listings with images
- Application: job applications
- Blog: content management
- EducationalProgram: education listings
- Promotion: paid promotion system
- PromotionConfig: promotion pricing and settings

## Environment Configuration

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_API_URL2=http://localhost:5000
```

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/searchnorthcyprus
JWT_SECRET=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:3000
```

## Development Workflow

1. **Starting Development:**
   - Frontend: `npm run dev` (runs on port 3000)
   - Backend: `cd backend && npm run dev` (runs on port 5000)

2. **Database Setup:**
   - Ensure MongoDB is running locally
   - Seed data: `cd backend && npm run db:seed`

3. **Testing:**
   - Backend tests: `cd backend && npm test`
   - Always run `npm run lint` before committing

## Key Integration Points

### Telegram Authentication
- Telegram widget integration for seamless auth
- Telegram data validation on backend
- User linking between email and Telegram accounts

### Image Management
- Direct Cloudinary uploads from frontend
- Automatic image optimization and storage
- Upload quota system for users

### Promotion System
- Paid listing promotion with cryptocurrency payments
- Admin approval workflow
- Time-based promotion expiry

### Admin Dashboard
- Comprehensive user and listing management
- Content moderation and reporting system
- Analytics and platform statistics

## Common Tasks

### Adding New API Endpoints
1. Create route in `backend/routes/`
2. Add controller logic in `backend/controllers/`
3. Update API client in `lib/api.ts`
4. Add TypeScript interfaces for request/response

### Creating New Pages
1. Add page in `app/` directory using Next.js App Router
2. Implement layout if needed
3. Add route protection in middleware if required
4. Update navigation components

### Database Changes
1. Update Mongoose models in `backend/models/`
2. Create migration scripts if needed
3. Update seed scripts
4. Test with sample data