# Disaster Map

A Next.js application that visualizes disaster information using Google Maps API, helping users stay informed about emergency situations in their area.

## Features

- Interactive map powered by Google Maps API
- Real-time disaster tracking and visualization
- Location-based disaster alerts
- Responsive design for mobile and desktop
- Fast performance with Next.js

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or higher
- npm or yarn package manager
- A Google Maps API key with Maps JavaScript API enabled

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd disaster-map
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

To get a Google Maps API key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Maps JavaScript API
4. Create credentials (API Key)
5. Copy the API key to your `.env.local` file

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
disaster-map/
├── app/                  # Next.js app directory
├── components/           # React components
├── public/              # Static assets
├── styles/              # CSS/styling files
├── lib/                 # Utility functions and helpers
└── .env.local          # Environment variables (not committed)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- **Next.js** - React framework for production
- **React** - UI library
- **Google Maps API** - Map visualization
- **TypeScript** (optional) - Type safety
- **Tailwind CSS** (optional) - Styling

## API Configuration

### Google Maps API Setup

Ensure the following APIs are enabled in your Google Cloud Console:
- Maps JavaScript API
- Geocoding API (if using address search)
- Places API (if using place search)

### API Restrictions (Recommended)

For security, restrict your API key:
1. Go to Google Cloud Console → Credentials
2. Edit your API key
3. Add HTTP referrer restrictions (e.g., `localhost:3000/*`, `yourdomain.com/*`)
4. Limit API access to only required APIs

