# FYNDO - Mobile-Optimized Progressive Web App

## Overview
FYNDO is a mobile-first Progressive Web App (PWA) designed to connect farmers with agricultural laborers (associates) for farm work. Its core purpose is to streamline the process of finding and hiring farm labor, empowering both farmers and workers in the agricultural sector. The platform features a modern, mobile-optimized user interface, multi-language support (English, Kannada, Hindi), and a comprehensive set of functionalities for job posting, discovery, and management. FYNDO aims to bridge the gap between agricultural workers and farmers, fostering efficient labor allocation and agricultural productivity.

**Status:** All three user types (Farmers, Associates, Admin) have complete, tested functionality ready for end-to-end testing. See `TESTING.md` for comprehensive testing workflows.

## User Preferences
I prefer clear, concise explanations and an iterative development approach. Please ask before making major architectural changes or introducing new dependencies. I value well-structured code and detailed comments where complexity warrants them. Ensure all changes are thoroughly tested.

## System Architecture

### UI/UX Decisions
The application features a modern, mobile-first design with a glassmorphic aesthetic, characterized by frosted glass effects, vibrant green gradients, and enhanced shadows. It utilizes a floating bottom navigation bar with a pill design and smooth transitions. An 8px grid system ensures consistent spacing. The color scheme is centered around a vibrant green primary color, semi-transparent card backgrounds, and a clear text hierarchy. Typography uses the Inter font with system fallbacks, adhering to a defined scale for headings, sections, cards, and body text.

### Technical Implementations
The frontend is built with React 18, TypeScript, Tailwind CSS, Shadcn UI, and Wouter for routing. State management is handled by React Query (TanStack Query v5), and internationalization uses i18next with browser language detection. Vite is used as the build tool. Icons are provided by Lucide React and React Icons. The backend is developed with Node.js and Express, currently using in-memory storage (with plans for PostgreSQL).

### Feature Specifications
FYNDO provides distinct workflows for farmers and associates.

**Farmer Workflow:**
- **Job Posting:** A multi-step guided flow for creating job listings, including service type selection, date/duration (dates restricted to day after tomorrow onwards), number of workers, budget with auto-calculation (Rs.650 × days × workers minimum), and location-based posting with a booking charge.
- **Job Management:** Farmers can view, edit, cancel, and complete their posted jobs, organized by status (Active, Cancelled, Completed).
- **Associate Rating System:** Farmers can rate and review associates upon job completion.

**Associate Workflow:**
- **Skill Selection:** First-time associates select their agricultural skills.
- **Job Discovery:** Associates can browse jobs with tabs: Available, Interested, Shortlisted, Completed. Jobs within 20km radius matching their skills.
- **Profile Management:** Associates can edit name/location via pencil icon, manage skills, set skill levels, configure hourly rates, and manage location preferences.

**Common Features:**
- **Simplified Login:** Phone number entry with "Continue" button (no OTP verification). New users go directly to profile setup.
- **Multi-Language Support:** Full i18next integration with language switching (English, Kannada, Hindi) and browser language auto-detection.
- **Location Services:** Reverse geocoding for displaying readable location names (using OpenStreetMap Nominatim API), 20km radius job filtering, and location validation.
- **Profile Editing:** Users can edit name and location via pencil icon on profile page. Mobile number is read-only.
- **Profile & Settings:** Users can view/edit profiles, manage language, and access account settings.
- **Admin Panel:** A separate interface (`/admin`) for managing jobs and users:
  - Secure session-based authentication (Username: admin, Password: $MartApp2025)
  - Jobs table with columns: Requested By, Mobile, Service, Workers, Days, Budget, Status, Action
  - "Post a Job" button allows admin to create jobs on behalf of farmers
  - Job details show Google Maps links for locations
  - User details include map links and associated jobs without ID columns

### System Design Choices
- **PWA Architecture:** Designed as a mobile-first Progressive Web App.
- **Modular Components:** UI components are built using Shadcn UI and Tailwind CSS for reusability and consistency.
- **Query Management:** Utilizes React Query for efficient data fetching, caching, and state synchronization, with robust cache invalidation strategies.
- **Type Safety:** TypeScript is used throughout the frontend and backend to ensure type safety and reduce errors.
- **API Structure:** A well-defined RESTful API handles user authentication, job creation/management, job interest, and reviews.
- **Custom Hooks:** Custom React hooks (e.g., `useJobCompletion`, `useLocationName`) encapsulate complex logic and promote code reusability.
- **Security Implementation:**
  - **Session Management:** Express-session with MemoryStore for server-side session storage
  - **Session Fixation Protection:** Session regeneration on admin login prevents fixation attacks
  - **CSRF Protection:** SameSite=lax cookie attribute prevents cross-site request forgery
  - **Cookie Security:** HttpOnly cookies prevent XSS, secure flag enabled in production
  - **Authorization Middleware:** All admin routes protected with requireAdmin middleware
  - **Session Timeout:** 24-hour session expiration with automatic cleanup
  - **Production Requirements:** Strong SESSION_SECRET environment variable must be configured in production

## External Dependencies

- **OpenStreetMap Nominatim API:** Used for reverse geocoding to convert coordinates into human-readable location names.
- **i18next:** Library for internationalization, enabling multi-language support.
- **Stripe:** Planned integration for payment gateway processing (booking charges).
- **Twilio:** Planned integration for OTP (One-Time Password) service.
- **PostgreSQL:** Planned database integration for persistent storage (currently using in-memory storage).