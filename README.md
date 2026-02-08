# EduChinaPro

A platform helping international students discover and apply to universities in China.

## Overview

EduChinaPro is a comprehensive platform that simplifies the process of studying in China for international students. The platform offers:

- **University Discovery** - Browse and search through top-ranked Chinese universities
- **Program Exploration** - Find programs matching your academic interests
- **Application Management** - Track and manage your university applications
- **Profile Building** - Create a compelling student profile for applications

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)/ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth/Google OAuth

## Project Structure

```
educhinapro/
├── app/
│   ├── auth/              # Authentication callback routes
│   ├── dashboard/         # Student dashboard pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── page.tsx           # Homepage
├── components/
│   ├── dashboard/         # Dashboard-specific components
│   ├── profile/           # Profile building components
│   ├── shared/            # Shared components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── repositories/      # Data access layer
│   ├── services/          # Business logic services
│   └── supabase/          # Supabase client setup
└── public/                # Static assets
```

## Design System

The project uses a custom design system with:

- **Brand Colors**: Sky blue palette (brand-50 to brand-950)
- **Primary Colors**: Slate gray palette (primary-50 to primary-950)
- **Typography**: Inter (sans) + Outfit (serif)
- Uses custom typography utilities like `brand-text`, `heading-1`, `body-large`, etc.

## Authentication

The app uses Supabase Auth with:

- Email/Password authentication
- OAuth (Google for now)

## Features

### Student Dashboard

- Build profile: One profile, apply to 12000+ universites
- Track profile completion progress
- Manage documents and submissions
- Track applicaiton status
- Notifications (In-app/email)
- In-app chat with counselor

### University Browsing

- Filter by ranking, location, and programs
- Detailed university pages

### Admin Panel/Staff Panel

- Add/Edit/Delete universities and programs
- Mange program specific configs
- Manage student applications
- Admin only - Manage staff accounts
- Admin only - Assign application to staff

## License

This project is proprietary software. All rights reserved.
