# College ERP Dashboard

A Duolingo-inspired, gamified college ERP dashboard built with React + Vite + JavaScript.

## Features

- 🎓 **Modern UI**: Duolingo-inspired design with playful colors and animations
- ⚡ **Fast Development**: Vite for lightning-fast development and builds
- 🎨 **Tailwind CSS**: Utility-first CSS framework with custom Duolingo green theme
- 🎭 **Framer Motion**: Smooth animations and transitions
- 🎯 **Lucide React**: Beautiful, consistent icons
- 🧪 **Testing**: Vitest + React Testing Library + fast-check for property-based testing
- 📱 **Responsive**: Desktop-first design that works on all devices

## Tech Stack

- **Frontend**: React 18 + JavaScript (no TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom theme
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library + fast-check
- **Font**: Nunito from Google Fonts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building

Build for production:

```bash
npm run build
```

### Testing

Run tests:

```bash
npm run test
```

Run tests with UI:

```bash
npm run test:ui
```

### Linting

Run ESLint:

```bash
npm run lint
```

## Project Structure

```
college-erp-dashboard/
├── public/
│   └── vite.svg
├── src/
│   ├── components/          # React components
│   ├── data/               # Static dummy data
│   ├── test/               # Test setup and utilities
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # App entry point
│   └── index.css           # Global styles
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies and scripts
```

## Design System

### Colors

- **Primary Green**: `#58CC02` (Duolingo green)
- **Primary Dark**: `#46A302` (hover state)
- **Background**: `#F7F7F7` (light gray)

### Typography

- **Font Family**: Nunito (Google Fonts)
- **Weights**: 400, 600, 700, 800, 900

### Animations

- Custom gradient animations
- Float animations for decorative elements
- Framer Motion for component transitions

## Requirements Fulfilled

✅ **1.1**: React + Vite + JavaScript (no TypeScript)  
✅ **1.2**: Tailwind CSS for all styling  
✅ **1.3**: Framer Motion for animations  
✅ **1.4**: Lucide React for icons  
✅ **1.5**: Static dummy data only (no APIs/backend)  
✅ **1.6**: Project runs with `npm run dev` without errors  
✅ **1.7**: Nunito font imported from Google Fonts

## License

This project is for educational purposes.
