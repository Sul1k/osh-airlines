OSH Airlines - Project Overview

🎯 Project Summary

OSH Airlines is a comprehensive Flight Ticketing Web Service built as a modern React application. It's a full-featured airline booking platform that demonstrates a complete flight reservation system with role-based access control, real-time booking management, and administrative capabilities.

🏗️ Architecture & Technology Stack

  Frontend Technologies

    -React 18 with TypeScript for type-safe development
    -Vite as the build tool and development server
    -React Router DOM for client-side routing
    -Tailwind CSS for utility-first styling
    -ShadCN UI components for consistent design system
    -Radix UI primitives for accessible components
    -Lucide React for iconography

  State Management

    -React Context API for global state management
    -Local Storage for authentication persistence
    -Custom hooks for data management    

  Backend Integration

    -Supabase for database and authentication
    -PostgreSQL database with Row Level Security (RLS)
    -Real-time subscriptions capability
    -Mock data system for development/demo purposes

🎭 User Roles & Access Control

The application implements a sophisticated 3-tier role system:

  1. Regular Users (user@osh.com / user123)

    -Search and book flights
    -View booking history
    -Cancel bookings (with refund policy)
    -Access user dashboard

  2. Company Managers (manager@osh.com / manager123)

    -Manage company flights (CRUD operations)
    -Set pricing for different seat classes
    -View passenger lists
    -Access company statistics dashboard
    -Manage seat availability

  3. Administrators (admin@osh.com / admin123)

    -Manage all platform users (block/unblock)
    -Add and manage airline companies
    -Create company manager accounts
    -Manage promotional banners
    -Manage gallery content
    -Platform-wide analytics

🚀 Core Features

  Landing Page

    -Auto-rotating banner carousel with promotional content
    -Advanced flight search with multiple filters
    -Featured flights showcase
    -Responsive design with modern UI

  Flight Search & Booking

    -Multi-criteria search: Origin, destination, dates, passengers, class, price range
    -Round-trip and one-way options
    -Real-time seat availability tracking
    -Dynamic pricing by seat class (Economy, Comfort, Business)
    -Instant booking confirmation with unique confirmation IDs
    -Automatic inventory management

  Booking Management

    -Cancellation policy: Free cancellation >24h before departure (full refund)
    -Booking history with status tracking
    -Confirmation ID search
    -Real-time seat updates
  
  Dashboard System

    -Role-based dashboards with different functionalities
    -Real-time analytics and statistics
    -Time-based filtering (Today, This Week, This Month, All Time)
    -Revenue tracking and passenger counts
    -Flight status monitoring

📁 Project Structure

  src/
├── components/           # Reusable UI components
│   ├── ui/              # ShadCN UI components
│   ├── figma/           # Figma-specific components
│   ├── FlightSearch.tsx # Main search component
│   └── Layout.tsx       # App layout wrapper
├── lib/                 # Core utilities and configuration
│   ├── context/         # React Context providers
│   ├── types.ts         # TypeScript type definitions
│   ├── mockData.ts      # Sample data for development
│   ├── supabase.ts      # Supabase client configuration
│   └── supabase-setup.sql # Database schema
├── pages/               # Route components
│   ├── Home.tsx         # Landing page
│   ├── Login.tsx        # Authentication
│   ├── UserDashboard.tsx
│   ├── CompanyDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── [other pages]
└── styles/              # Global styles

🗄️ Database Schema

  -The application uses a PostgreSQL database with the following key tables:
  -users: User profiles with roles and authentication
  -companies: Airline companies with manager assignments
  -flights: Flight information with pricing and seat availability
  -bookings: Ticket reservations with confirmation tracking
  -banners: Promotional content for the landing page
  -gallery: Image management for the website

🔐 Security Features

  -Row Level Security (RLS) policies for data protection
  -Role-based access control throughout the application
  -Protected routes with authentication checks
  -Input validation and sanitization
  -Secure authentication with Supabase Auth

🎨 Design System

  -Modern, clean interface with professional airline aesthetics
  -Responsive design that works on all devices
  -Consistent component library using ShadCN UI
  -Accessible components built on Radix UI primitives
  -Professional color scheme and typography

🚦 Getting Started

  -Install dependencies: npm install
  -Start development server: npm run dev
  -Set up Supabase (optional): Follow /src/SUPABASE_SETUP.md
  -Use demo accounts for testing different user roles

📊 Key Metrics & Analytics

  -The application includes comprehensive analytics for:
  -Revenue tracking across different time periods
  -Passenger statistics and booking trends
  -Flight performance metrics
  -Company-specific and platform-wide insights

🔄 Development Status

  -This is a production-ready demo application that showcases:
  -Modern React development practices
  -Type-safe development with TypeScript
  -Professional UI/UX design
  -Comprehensive business logic
  -Scalable architecture patterns
  -Real-world application features

The project demonstrates a complete full-stack web application suitable for learning, portfolio demonstration, or as a foundation for a real airline booking system.