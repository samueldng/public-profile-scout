# Public Profile Scout - Project Documentation

## Overview
Public Profile Scout is an OSINT (Open Source Intelligence) tool that allows users to search for publicly available information about individuals across various platforms. The application follows ethical and legal guidelines, collecting only publicly accessible data.

## Technology Stack
- **Frontend**: React with TypeScript, Vite, TailwindCSS, ShadCN UI components
- **Backend**: Supabase (Database, Authentication, Functions)
- **Animation**: Framer Motion
- **State Management**: React Query
- **Routing**: React Router DOM

## Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI elements from shadcn
│   ├── Hero3D.tsx      # 3D hero component
│   ├── NavLink.tsx     # Navigation link component
│   ├── PricingCard.tsx # Pricing card component
│   └── SearchForm.tsx  # Search form component
├── hooks/              # Custom React hooks
├── integrations/       # Third-party service integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions
├── pages/              # Page components
│   ├── Index.tsx       # Homepage
│   ├── Search.tsx      # Search page
│   ├── Results.tsx     # Results page
│   ├── HowItWorks.tsx  # How it works page
│   ├── Terms.tsx       # Terms of service
│   ├── Privacy.tsx     # Privacy policy
│   └── NotFound.tsx    # 404 page
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles

supabase/
├── functions/          # Serverless functions
│   ├── create-search-job/
│   ├── get-search-job/
│   └── process-search-job/
├── migrations/         # Database schema migrations
└── config.toml         # Supabase configuration
```

## Core Functionality

### 1. Search Process
1. User fills search form with name (required) and optional fields (username, city)
2. User selects plan (Basic: R$4.90 or Complete: R$14.90)
3. User agrees to terms and submits form
4. Application creates a search job via Supabase function
5. Search job is immediately processed (payment simulation)
6. User is redirected to results page
7. Results page polls for job status and displays results when complete

### 2. Supabase Functions

#### create-search-job
- Creates a new search job in the database
- Validates input parameters
- Returns job ID and estimated processing time

#### process-search-job
- Processes the search job by simulating OSINT searches
- Updates job status from pending → processing → completed/failed
- Stores results in the database

#### get-search-job
- Retrieves job status and results from the database
- Used by the frontend to poll for updates

### 3. Database Schema
- `search_jobs`: Stores search requests and results
- `payments`: Stores payment information (currently unused)
- Enums for job status and search plans

## Current Limitations
1. Search functionality currently uses simulated data rather than real OSINT sources
2. Payment system has been removed to focus on search functionality
3. Requires Docker/Supabase CLI for local development

## Pending Tasks

### 1. Implement Real OSINT Functionality
The current search functions only simulate results. To make the application functional, we need to:
- Integrate with real OSINT APIs and scraping services
- Implement proper error handling and rate limiting
- Add more data sources for comprehensive searches

### 2. Deploy Supabase Functions
The functions need to be deployed to the Supabase project for production use.

### 3. Enhance Security
- Implement proper authentication and authorization
- Add rate limiting to prevent abuse
- Secure API endpoints

## Testing the Current Workflow

To test the current functionality:
1. Visit the homepage at http://localhost:8080
2. Click "Fazer Pesquisa Agora"
3. Fill in a name and select a plan
4. Agree to terms and submit
5. The results page will show simulated data

## Next Steps

1. Test current search functionality with remote Supabase instance
2. Replace simulated OSINT searches with real data sources
3. Deploy functions to production
4. Conduct end-to-end testing