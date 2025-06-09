# المصراوي - Egyptian Social Media Platform

A modern social media platform inspired by Egyptian culture, built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Authentication System**: Login, register, and password reset functionality
- **Social Feed**: View and interact with posts from other users
- **Post Creation**: Create posts with text, images, and videos
- **User Profiles**: Customizable user profiles with bio and avatar
- **Search & Discovery**: Search for users and posts
- **Real-time Interactions**: Like, comment, and follow functionality
- **Notifications**: Stay updated with likes, comments, and follows
- **Mobile-First Design**: Responsive design optimized for all devices

## Pages

1. **Login** (`/login`) - User authentication
2. **Register** (`/register`) - New user registration
3. **Forgot Password** (`/forgot-password`) - Password recovery
4. **Home** (`/home`) - Main social feed
5. **Create Post** (`/create-post`) - Create new posts
6. **Post Detail** (`/post/:postId`) - Individual post view
7. **Profile** (`/profile/:username`) - User profiles
8. **Edit Profile** (`/edit-profile`) - Profile management
9. **Search** (`/search`) - Search functionality
10. **Explore** (`/explore`) - Content discovery
11. **Notifications** (`/notifications`) - User notifications
12. **Settings** (`/settings`) - Account settings

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Icons**: Lucide React
- **Routing**: React Router Dom
- **Build Tool**: Vite

## Database Schema

- **profiles**: User profile information
- **posts**: User posts with content and media
- **comments**: Post comments
- **likes**: Post likes
- **follows**: User follow relationships
- **notifications**: User notifications

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your Supabase URL and anon key
3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the database migrations in the Supabase SQL editor
5. Install dependencies: `npm install`
6. Start the development server: `npm run dev`

## Design Features

- **Egyptian-inspired color palette**: Nile blue, golden accents, warm earth tones
- **Arabic-friendly typography**: Right-to-left layout support
- **Modern UI components**: Clean cards, smooth animations, responsive design
- **Cultural elements**: Subtle Egyptian design touches in modern context

## Development

- **ESLint**: Code linting and formatting
- **TypeScript**: Type safety and better development experience
- **Modular Architecture**: Clean separation of concerns
- **Responsive Design**: Mobile-first approach with desktop enhancements

## License

This project is for educational purposes and demonstration of modern web development practices.